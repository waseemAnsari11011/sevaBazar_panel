import axiosInstance from "../../utils/axiosConfig";


const  getBannerById = async(id)=>{
    try{
        const response = await axiosInstance.get(`/Banner/${id}`);
        console.log(response.data)
        return response.data;
    }
    catch{
        console.error('Failed to retrieve category:', error);
    throw error;
    }
}
export default getBannerById;