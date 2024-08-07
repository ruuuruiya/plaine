import Service from "./sections/Service"
import Hero from "./sections/Hero"
import LastCTA from "./sections/LastCTA"
import Review from "./sections/Review"
import Side from "./sections/Side"
import Collab from "./sections/Collab"

const HomePage = ({ session }) => {
    return (
        <>
            <Hero session={session}/>
            <Service />
            <Collab />
            <Side />
            <Review />
            <LastCTA session={session}/>
        </>
    )
}

export default HomePage
