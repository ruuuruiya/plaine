import OverviewPage from "@/components/pages/dashboard/side/overview/OverviewPage";
import User from "@/models/userSchema";
import connectDB from "@/config/db";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { updateAllRecommendations, updateHealthStatus, updatePotentialHealthIssues } from "@/app/actions/userActions";
import { redirect } from "next/navigation";
import Plan from "@/models/planSchema";

export const metadata = {
    title: 'Overview',
    description: 'Your account overview',
};

const Page = async () => {

    const auth_session = await auth();
    if (!auth_session) redirect("/");
    const user_id = auth_session?.user?.user_id;

    // Get Personal Information
    await connectDB();
    const [user, plan] = await Promise.all([
        await User.findOne({ user_id }).select("recommendations health_issues health_status last_login").lean(),
        await Plan.findOne({ user_id }).lean(),
    ]);
    if (!user) redirect('/');

    // Filter Plan Col "0" n "1" + Sort By Column n Status + Get First 3 Plan
    const filteredPlans = plan?.plan_list?.filter(plan => plan.column === '0' || plan.column === '1') || [];
    const sortedPlans = filteredPlans?.sort((a, b) => {
        if (a.column !== b.column) {
            return parseInt(b.column) - parseInt(a.column);
        };
        return parseInt(b.status) - parseInt(a.status);
    });
    const shownPlans = sortedPlans?.slice(0, 3) || [];

    // Daily Update - Health Status, Recommendations, Potential Health Issues
    const currentDate = new Date().toISOString().split("T")[0];
    const lastLogin = user?.last_login ? new Date(user.last_login).toISOString().split("T")[0] : null;
    if (currentDate !== lastLogin) {
        const [resHealth, resRec, resPot] = await Promise.all([updateHealthStatus(), updateAllRecommendations(), updatePotentialHealthIssues()]);
        if (resHealth.success && resRec.success && resPot.success) {
            user.health_status.status = resHealth.data.status || "0";
            user.health_status.description = resHealth.data.description || "";
            user.recommendations.food = resRec.data.food || [];
            user.recommendations.exercise = resRec.data.exercise || [];
            user.recommendations.activity = resRec.data.activity || [];
            user.health_issues = resPot.data || [];
        } else {
            user.health_status.status = "0";
            user.health_status.description = "Something Went Wrong";
            user.recommendations.food = [];
            user.recommendations.exercise = [];
            user.recommendations.activity = [];
            user.health_issues = [];
        }
    };

    // Displayed
    const plainUser = {
        health_status: {
            status: user.health_status.status,
            description: user.health_status.description,
        },
        recommendations: {
            food: user.recommendations.food,
            exercise: user.recommendations.exercise,
            activity: user.recommendations.activity,
        },
        health_issues: user.health_issues,
        shown_plans: shownPlans,
    };

    return <OverviewPage plainUser={plainUser} />;
};

export default Page;
