'use server';
import { getSupabaseServerClient } from '../supabase/server';

async function requireStaff() {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (data?.role !== 'staff') throw new Error('Not authorized');
    return supabase;
}

export async function createTopicBankItem({ name, detail = '', parent_id = null, is_key = false }) {
    const supabase = await requireStaff();

    // Assign position after the last sibling
    const { data: siblings } = await supabase
        .from('topic_bank')
        .select('position')
        .eq('parent_id', parent_id ?? null)
        .order('position', { ascending: false })
        .limit(1);
    const position = siblings?.length > 0 ? (siblings[0].position + 1) : 0;

    const { data, error } = await supabase
        .from('topic_bank')
        .insert({ name: name.trim(), detail: detail.trim(), parent_id, is_key, position })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateTopicBankItem(id, updates) {
    const supabase = await requireStaff();
    if (updates.name !== undefined) updates = { ...updates, name: updates.name.trim() };
    if (updates.detail !== undefined) updates = { ...updates, detail: updates.detail.trim() };
    const { data, error } = await supabase
        .from('topic_bank')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteTopicBankItem(id) {
    const supabase = await requireStaff();
    const { error } = await supabase.from('topic_bank').delete().eq('id', id);
    if (error) throw error;
}

// Batch-update positions for a sibling group after drag-reorder.
// orderedIds: the sibling IDs in their new desired order.
export async function reorderTopicBankItems(orderedIds) {
    const supabase = await requireStaff();
    await Promise.all(
        orderedIds.map((id, index) =>
            supabase.from('topic_bank').update({ position: index }).eq('id', id)
        )
    );
}

// Reparent a topic and insert it just before beforeId in the new parent's list.
// beforeId = null means append at the end.
export async function reparentAndPositionTopicBankItem(id, newParentId, beforeId) {
    const supabase = await requireStaff();

    // Move to new parent first
    await supabase.from('topic_bank').update({ parent_id: newParentId }).eq('id', id);

    // Fetch all new siblings (including the just-moved item) by position
    let query = supabase.from('topic_bank').select('id').order('position');
    query = newParentId === null ? query.is('parent_id', null) : query.eq('parent_id', newParentId);
    const { data: siblings } = await query;

    // Build desired order
    const all = (siblings || []);
    const withoutItem = all.filter(s => s.id !== id);
    const insertIdx = beforeId ? withoutItem.findIndex(s => s.id === beforeId) : withoutItem.length;
    withoutItem.splice(insertIdx === -1 ? withoutItem.length : insertIdx, 0, { id });

    await Promise.all(withoutItem.map((s, i) =>
        supabase.from('topic_bank').update({ position: i }).eq('id', s.id)
    ));
}

// Restore a batch of rows to their pre-mutation state (used by undo).
export async function restoreTopicBankSnapshot(items) {
    const supabase = await requireStaff();
    await Promise.all(
        items.map(({ id, name, detail, parent_id, is_key, position }) =>
            supabase.from('topic_bank')
                .update({ name, detail, parent_id, is_key, position })
                .eq('id', id)
        )
    );
}

// Move a topic to a new parent, appending it at the end of the new parent's children.
export async function reparentTopicBankItem(id, newParentId) {
    const supabase = await requireStaff();
    const { data: siblings } = await supabase
        .from('topic_bank')
        .select('position')
        .eq('parent_id', newParentId ?? null)
        .order('position', { ascending: false })
        .limit(1);
    const position = siblings?.length > 0 ? (siblings[0].position + 1) : 0;
    return updateTopicBankItem(id, { parent_id: newParentId, position });
}

// Promote: move topic up one level (parent becomes grandparent, or null)
export async function promoteTopicBankItem(id, allTopics) {
    const topic = allTopics.find(t => t.id === id);
    if (!topic || !topic.parent_id) return null;
    const parent = allTopics.find(t => t.id === topic.parent_id);
    const newParentId = parent?.parent_id ?? null;
    // Append after last sibling at the new level
    const siblings = allTopics
        .filter(t => t.parent_id === newParentId && t.id !== id)
        .sort((a, b) => b.position - a.position);
    const position = siblings.length > 0 ? siblings[0].position + 1 : 0;
    return updateTopicBankItem(id, { parent_id: newParentId, position });
}

// Demote: make topic a child of the previous sibling (by position)
export async function demoteTopicBankItem(id, allTopics) {
    const topic = allTopics.find(t => t.id === id);
    if (!topic) return null;

    const siblings = allTopics
        .filter(t => t.parent_id === topic.parent_id)
        .sort((a, b) => a.position - b.position);

    const idx = siblings.findIndex(t => t.id === id);
    if (idx <= 0) return null;

    const prevSibling = siblings[idx - 1];
    // Append after last child of the previous sibling
    const prevSiblingChildren = allTopics
        .filter(t => t.parent_id === prevSibling.id)
        .sort((a, b) => b.position - a.position);
    const position = prevSiblingChildren.length > 0 ? prevSiblingChildren[0].position + 1 : 0;
    return updateTopicBankItem(id, { parent_id: prevSibling.id, position });
}
