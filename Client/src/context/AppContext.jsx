import React, { useEffect } from "react";
import { createContext, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export const AppContext = createContext();

const AppContextProvider = (props)=>{

     const [user, setUser] = useState(null);
     const [showLogin, setShowLogin] = useState(false);
     const [token, setToken] = useState(localStorage.getItem("token"));
     const [credit, setCredit] = useState(false);

     const backendURL=import.meta.env.VITE_BACKEND_URL;

     const navigate=useNavigate();

     const loadCreditsData= async ()=>{
            try {
                    const {data}= await axios.get(backendURL + '/api/user/credits', { headers: {token} 
                  
            });
               if (data.success) {
                   setCredit(data.credits);
                   setUser(data.user);
               } else {
                   toast.error(data.message);
               }
            } catch (error) {
                console.log(error)
                toast.error(error.message);
            }
     }

     const generateImage= async (prompt)=>{
          const userId = user._id;
          try {
              const {data}= await axios.post(backendURL + '/api/image/generate-image', { prompt}, { headers: {token} });

                 if (data.success) {
                    loadCreditsData();
                    return data.resultImage;
                 }else {
                    toast.error(data.message);
                    loadCreditsData();
                    if (data.creditBalance === 0) {
                        navigate('/buy-credits');
                    }
                 }
          
          
          
          } catch (error) {
               toast.error(error.message)
          }
     }




     const logout=()=>{
          setUser(null);
          setToken('');
          localStorage.removeItem("token");
     }


     useEffect(() => {
          if (token) {
               loadCreditsData();
          }
     },[token])



     const value={
        user,setUser,showLogin,setShowLogin,backendURL,token,setToken,credit,setCredit, loadCreditsData,logout, generateImage
     }

     return( <AppContext.Provider value={value}>
          {props.children}
     </AppContext.Provider>
     )  

}

export default AppContextProvider;