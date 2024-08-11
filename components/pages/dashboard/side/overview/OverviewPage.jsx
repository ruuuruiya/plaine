"use client"

import { PageTitle } from '@/components/Utils'
import HealthStatus from './parts/HealthStatus'
import { useState } from 'react'
import HealthDescription from './parts/HealthDescription'
import RecommendationSection from './parts/RecommendationSection'
import PotentialHealthIssues from './parts/PotentialHealthIssues'
import Planning from './parts/Planning'

const OverviewPage = ({ plainUser }) => {

    const [status, setStatus] = useState(plainUser.health_status.status);
    const [description, setDescription] = useState(plainUser.health_status.description);
    const [foodRecommendations, setFoodRecommendations] =  useState(plainUser.recommendations.food);
    const [exerciseRecommendations, setExerciseRecommendations] = useState(plainUser.recommendations.exercise);
    const [activityRecommendations, setActivityRecommendations] = useState(plainUser.recommendations.activity);
    const [healthIssues, setHealthIssues] = useState(plainUser.health_issues);

    return (
        <div className='flex flex-col gap-8 p-5'>
            <PageTitle title={`Overview`} description={"Your Medical Practice Overview"}/>

            <div className="flex flex-col md:flex-row gap-5">
                <HealthStatus status={status} />
                <HealthDescription description={description} setStatus={setStatus} setDescription={setDescription} />
            </div>

            <div className="flex items-center pt-2">
                <div className="border-t border-gray-400 w-full"></div>
                <div className="px-3 leading-none text-neutral-400 text-sm text-nowrap">DAILY RECOMMENDATIONS</div>
                <div className="border-t border-gray-400 w-full"></div>
            </div>

            <div className="flex flex-col md:flex-row gap-5">
                <RecommendationSection title={"Food"} lists={foodRecommendations} setState={setFoodRecommendations}/>
                <RecommendationSection title={"Exercise"} lists={exerciseRecommendations} setState={setExerciseRecommendations}/>
                <RecommendationSection title={"Activity"} lists={activityRecommendations} setState={setActivityRecommendations}/>
            </div>

            <div className="flex items-center pt-2">
                <div className="border-t border-gray-400 w-full"></div>
                <div className="px-3 leading-none text-neutral-400 text-sm text-nowrap">IMPORTANT</div>
                <div className="border-t border-gray-400 w-full"></div>
            </div>

            <div className="flex flex-col md:flex-row gap-5">
                <PotentialHealthIssues healthIssues={healthIssues} setHealthIssues={setHealthIssues} />
                <Planning plans={plainUser.shown_plans} />
            </div>
        </div>
    )
};

export default OverviewPage;
