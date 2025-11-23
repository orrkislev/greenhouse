import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";

export function useScreenData(groupId, includeStaff = false) {
    const [group, setGroup] = useState(null);
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Fetch group info
                const { data: groupData, error: groupError } = await supabase
                    .from('groups')
                    .select('*')
                    .eq('id', groupId)
                    .single();

                if (groupError) throw groupError;
                setGroup(groupData);

                // Fetch all users in the group
                const { data: usersGroupsData, error: usersGroupsError } = await supabase
                    .from('users_groups')
                    .select('users( id, first_name, last_name, username, avatar_url, role )')
                    .eq('group_id', groupId);

                if (usersGroupsError) throw usersGroupsError;

                // Filter based on includeStaff flag and sort by first name
                const usersList = usersGroupsData
                    .map(d => d.users)
                    .filter(user => includeStaff || user.role === 'student')
                    .sort((a, b) => a.first_name.localeCompare(b.first_name, 'he'));

                setStudents(usersList);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [groupId, includeStaff]);

    return { group, students, isLoading };
}

export function useColumnLayout(students) {
    const [columns, setColumns] = useState([]);

    useEffect(() => {
        if (students.length === 0) return;

        // Determine number of columns based on student count
        let columnCount;
        if (students.length <= 5) columnCount = 2;
        else if (students.length <= 10) columnCount = 3;
        else if (students.length <= 15) columnCount = 4;
        else columnCount = 5;

        // Distribute students across columns
        const cols = Array.from({ length: columnCount }, () => []);
        students.forEach((student, index) => {
            cols[index % columnCount].push(student);
        });

        setColumns(cols);
    }, [students]);

    return columns;
}
