import { response } from "express";
import userModel from "../models/userModel.js";
import FormData from "form-data";
import axios from "axios";


 export const generateImage = async (req, res) => {
    

    try {
         //console.log("Request body:", req.body);             
        const { prompt} = req.body;
        const userId = req.userId;                                   //added this
       // console.log("userId:", userId);                        //added these 2 also
        //console.log("prompt:", prompt);

        const user=await userModel.findById(userId);

         if (!user || !prompt) {
             return res.json({ success: false, message: 'Missing Details', userId, prompt });
         }

         if (user.creditBalance === 0 || user.creditBalance <0)  {
             return res.json({ success: false, message: 'Insufficient credits', creditBalance: user.creditBalance });
         }

         const formData= new FormData();
         formData.append("prompt", prompt);

         const {data}= await axios.post('https://clipdrop-api.co/text-to-image/v1', formData, {               //to store response of api call in data
              headers: {
                  'x-api-key': process.env.CLIPDROP_API,
              }, responseType: 'arraybuffer'
          });

        const  base64Image=Buffer.from(data, 'binary').toString('base64');                           //to convert image to base64 format
        const resultImage= `data:image/png;base64,${base64Image}`;          
        
        await userModel.findByIdAndUpdate(user._id, {creditBalance: user.creditBalance-1} );  //to decrease credit balance by 1
        res.json({ success: true, message: 'Image Generated Successfully', creditBalance: user.creditBalance-1,resultImage });



    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
