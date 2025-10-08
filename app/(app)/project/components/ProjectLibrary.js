import { useEffect } from 'react'
import { getSnapshot, loadSnapshot, Tldraw, useEditor } from 'tldraw'
import 'tldraw/tldraw.css'
import { debounce } from 'lodash'
import { projectActions, useProjectData } from '@/utils/store/useProject'

export default function ProjectLibrary() {

    const components = {
        // ContextMenu: null,
        ActionsMenu: null,
        HelpMenu: null,
        ZoomMenu: null,
        MainMenu: null,
        // Minimap: null,
        StylePanel: null,
        // PageMenu: null,
        // NavigationPanel: null,
        // KeyboardShortcutsDialog: null,
        // QuickActions: null,
        // HelperButtons: null,
        // DebugPanel: null,
        // DebugMenu: null,
        // SharePanel: null,
        MenuPanel: null,
        // TopPanel: null,
        // CursorChatBubble: null,
        // RichTextToolbar: null,
        // ImageToolbar: null,
        // VideoToolbar: null,
        // Dialogs: null,
        // Toasts: null,
        // A11y: null,
    }

    return (
        <div className='w-full h-[50vh] bg-red-500'>
            <Tldraw components={components}>
                <SaveLogic />
            </Tldraw>
        </div>
    )
}

function SaveLogic() {
    const editor = useEditor()
    const project = useProjectData(state => state.project)

    useEffect(()=>{
        if (!editor) return
        if (!project.metadata.tldraw) return
        loadSnapshot(editor.store, project.metadata.tldraw)
    }, [project, editor])

    useEffect(() => {
        if (!editor) return;
        editor.setCurrentTool('draw')
        const unlisten = editor.store.listen(
            (update) => {
                onEveryChange()
            },
            { scope: 'document', source: 'user' }
        )
        return () => unlisten()
    }, [editor])

    const onEveryChange = debounce(() => {
        const { document, session } = getSnapshot(editor.store)
        projectActions.updateMetadata({tldraw: {document, session}})
    }, 1000)

    return null
}