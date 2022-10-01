import TinderCard from 'react-tinder-card';
import ChatContainer from '../components/ChatContainer'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const Dashboard = () => {

    const [user, setUser] = useState(null)
    const [genderedUsers, setGenderedUsers] = useState(null)
    const [lastDirection, setLastDirection] = useState()
    const [cookies, setCookie, removeCookie] = useState(['user'])

    const userId = cookies.UserId

    const getUser = async () => {
        try {
            const response = await axios.get('http://localhost:8000/user', {
                params: { userId }
            })
            setUser(response.data)
        } catch (error) {
            console.log(error)
        }
    }

    const getGenderedUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/gendered-users', {
                params: {gender: user?.gender_interest}
            })
            setGenderedUsers(response.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getUser()
    }, [])

    useEffect(() => {
        if (user) {
            getGenderedUsers()
        }
    }, [user])

    const updateMatches = async (matchedUserId) => {
        try {
            await axios.put('http://localhost:8000/addmatch', {
                userId,
                matchedUserId
            })
            getUser()
        } catch (err) {
            console.log(err)
        }
    }
    
    const swiped = (direction, swipedUserId) => {
        if (direction === 'right') {
            updateMatches(swipedUserId)
        }
        setLastDirection(direction)
    }

    const outOfFrame = (name) => {
        console.log(name + ' left the screen!')
    }

    const matchedUserIds = user?.matches.map(({user_id}) => user_id).concat(userId)

    const filteredGenderedUsers = genderedUsers?.filter(genderedUser => !matchedUserIds.includes(genderedUser.user_id))

    return (

        <div className="dashboard">
            <ChatContainer user={user}/>
            <div className="swipe-container">
                <div className="card-container">
                    {filteredGenderedUsers?.map((genderedUsers) =>
                        <TinderCard 
                            className='swipe' 
                            key={genderedUsers.name} 
                            onSwipe={(dir) => swiped(dir, genderedUsers.user_id)} 
                            onCardLeftScreen={() => outOfFrame(genderedUsers.first_name)}>
                            <div style={{ backgroundImage: 'url(' + genderedUsers.url + ')' }} 
                                className='card'
                            >
                                <h3>{genderedUsers.first_name}</h3>
                            </div>
                        </TinderCard>
                    )}

                    <div className="swipe-info">
                        {lastDirection ? <p>You swiperd {lastDirection}</p>: <p/>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard