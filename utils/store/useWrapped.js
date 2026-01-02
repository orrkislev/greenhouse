import { createStore } from "./utils/createStore";
import { supabase } from "../supabase/client";

export const [useWrapped, wrappedActions] = createStore((set, get, withUser) => ({
    stats: null,
    loading: false,

    loadStats: withUser(async (user) => {
        set({ loading: true, stats: null });

        const year2025Start = '2025-01-01';
        const year2025End = '2025-12-31';

        // Fetch all data in parallel
        const [
            logsResult,
            projectsResult,
            tasksResult,
            studyPathsResult,
            researchResult,
            classMembersResult,
        ] = await Promise.all([
            // Logs for the year
            supabase.from('logs').select('*')
                .eq('user_id', user.id)
                .gte('created_at', year2025Start)
                .lte('created_at', year2025End),

            // Projects - sorted by created_at ascending to get the FIRST project
            supabase.from('projects').select('*')
                .eq('student_id', user.id)
                .gte('created_at', year2025Start)
                .order('created_at', { ascending: true }),

            // Tasks
            supabase.from('tasks').select('*')
                .eq('student_id', user.id)
                .gte('created_at', year2025Start),

            // Study paths
            supabase.from('study_paths').select('*')
                .eq('student_id', user.id),

            // Research
            supabase.from('research').select('*')
                .eq('student_id', user.id)
                .gte('created_at', year2025Start),

            // Get class members (to find staff mentors)
            supabase.rpc('get_user_groups', {
                p_user_id: user.id
            }),
        ]);

        const logs = logsResult.data || [];
        const projects = projectsResult.data || [];
        const tasks = tasksResult.data || [];
        const studyPaths = studyPathsResult.data || [];
        const research = researchResult.data || [];
        const classMembers = classMembersResult.data.filter(g => g.type === 'class')[0]?.mentors || [];

        // Calculate stats
        const completedTasks = tasks.filter(t => t.status === 'completed');
        const totalTasks = tasks.length;

        // Group logs by month
        const logsByMonth = {};
        logs.forEach(log => {
            const month = new Date(log.created_at).getMonth();
            logsByMonth[month] = (logsByMonth[month] || 0) + 1;
        });
        const mostActiveMonth = Object.entries(logsByMonth)
            .sort((a, b) => b[1] - a[1])[0];

        // Calculate active days:
        // days with at least one log, or ANY activity - created_at or updated_at for any item (projects, tasks, research)
        const activeDays = new Set();

        const addDateToSet = (dateStr) => {
            if (!dateStr) return;
            const day = new Date(dateStr).toISOString().split('T')[0];
            // Only include days in 2025
            if (day >= year2025Start && day <= year2025End) {
                activeDays.add(day);
            }
        };

        // Add days from logs
        logs.forEach(log => addDateToSet(log.created_at));

        // Add days from projects (created_at and updated_at)
        projects.forEach(project => {
            addDateToSet(project.created_at);
            addDateToSet(project.updated_at);
        });

        // Add days from tasks (created_at and updated_at)
        tasks.forEach(task => {
            addDateToSet(task.created_at);
            addDateToSet(task.updated_at);
        });

        // Add days from study paths (created_at and updated_at)
        studyPaths.forEach(path => {
            addDateToSet(path.created_at);
            addDateToSet(path.updated_at);
        });

        // Add days from research (created_at and updated_at)
        research.forEach(doc => {
            addDateToSet(doc.created_at);
            addDateToSet(doc.updated_at);
        });

        // Find longest streak
        let longestStreak = 0;
        let currentStreak = 0;
        const sortedDays = Array.from(activeDays).sort();
        for (let i = 0; i < sortedDays.length; i++) {
            if (i === 0) {
                currentStreak = 1;
            } else {
                const prevDay = new Date(sortedDays[i - 1]);
                const currDay = new Date(sortedDays[i]);
                const diffDays = (currDay - prevDay) / (1000 * 60 * 60 * 24);
                if (diffDays === 1) {
                    currentStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, currentStreak);
                    currentStreak = 1;
                }
            }
            longestStreak = Math.max(longestStreak, currentStreak);
        }

        // Study paths stats
        const totalVocabulary = studyPaths.reduce((acc, path) =>
            acc + (path.vocabulary?.length || 0), 0);
        const totalSources = studyPaths.reduce((acc, path) =>
            acc + (path.sources?.length || 0), 0);

        // Calculate word count from research
        const totalResearchWords = research.reduce((acc, r) => {
            const content = r.content || '';
            return acc + content.split(/\s+/).filter(w => w).length;
        }, 0);

        // Get featured research (first one, sorted by created_at)
        const sortedResearch = [...research].sort((a, b) =>
            new Date(a.created_at) - new Date(b.created_at)
        );
        const featuredResearch = sortedResearch.length > 0 ? sortedResearch[0] : null;
        let researchReviewSummary = null;
        if (featuredResearch?.metadata?.review?.summary) {
            researchReviewSummary = featuredResearch.metadata.review.summary;
        }

        // Get featured project (first one with most data)
        const featuredProject = projects.length > 0 ? projects[0] : null;
        let projectReviewScore = null;
        let projectReviewSummary = null;
        if (featuredProject?.metadata?.review) {
            const review = featuredProject.metadata.review;
            projectReviewSummary = review.summary || null;
            if (review['למידה וביצוע']?.overview !== undefined) {
                projectReviewScore = review['למידה וביצוע'].overview;
            }
        }

        const mentors = classMembers.filter(m => !m.is_admin);

        const stats = {
            // Activity
            totalLogs: logs.length,
            activeDays: activeDays.size,
            longestStreak,
            mostActiveMonth: mostActiveMonth ? {
                month: mostActiveMonth[0],
                count: mostActiveMonth[1]
            } : null,

            // Featured Project
            featuredProject: featuredProject ? {
                title: featuredProject.title,
                image: featuredProject.metadata?.image || null,
                reviewScore: projectReviewScore,
                reviewSummary: projectReviewSummary,
            } : null,
            projectsCreated: projects.length,

            // Mentors
            mentors,

            // Tasks
            totalTasks,
            completedTasks: completedTasks.length,
            taskCompletionRate: totalTasks > 0
                ? Math.round((completedTasks.length / totalTasks) * 100)
                : 0,

            // Study
            studyPaths: studyPaths.length,
            studyPathsData: studyPaths.map(path => ({
                id: path.id,
                title: path.title,
                vocabulary: path.vocabulary || [],
                sourcesCount: path.sources?.length || 0,
            })),
            vocabularyLearned: totalVocabulary,
            sourcesAdded: totalSources,

            // Research
            researchDocuments: research.length,
            researchWords: totalResearchWords,
            featuredResearch: featuredResearch ? {
                title: featuredResearch.title,
                reviewSummary: researchReviewSummary,
                vocabulary: featuredResearch.sections?.vocabulary || [],
            } : null,

            // User info
            userName: user.first_name,
            memberSince: user.created_at,
            pronouns: user.profile?.pronouns || 'he',
        };

        set({ stats, loading: false });
    }),
}));
