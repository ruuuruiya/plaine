import { auth } from "@/app/api/auth/[...nextauth]/route";
import Board from "./Board";
import Plan from "@/models/planSchema";

const PlanPage = async () => {
    const auth_session = await auth();
    const user_id = auth_session?.user?.user_id;

    // Get Card Lists
    const plan = await Plan.findOne({ user_id }).lean();
    let plainCardLists = plan?.plan_list?.map((obj) => {
        let { _id, ...rest } = obj;
        return rest;
    });

    return (
        <div className="flex flex-col gap-5 p-5">
            <Board initialCards={plainCardLists} />
        </div>
    );
};

export default PlanPage;
