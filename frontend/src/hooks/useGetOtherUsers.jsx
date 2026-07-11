import { useEffect } from 'react'
import axios from "axios";
import {useDispatch} from "react-redux";
import { setOtherUsers } from '../redux/userSlice';
import { API_URL_USER } from '../utils/constants';

const useGetOtherUsers = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchOtherUsers = async () => {
            try {
                
                const res = await axios.get(`${API_URL_USER}/`,
                    {
                        withCredentials:true,
                    }
                );
               
                dispatch(setOtherUsers(res.data.users));
            } catch (error) {
                console.log(error);
            }
        }
        fetchOtherUsers();
    },[dispatch])
  
}

export default useGetOtherUsers


