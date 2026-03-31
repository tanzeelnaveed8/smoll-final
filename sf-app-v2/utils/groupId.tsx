import AsyncStorage from "@react-native-async-storage/async-storage"

export const getGroupID=()=>{
    try{
const id=AsyncStorage.getItem("GROUP_ID");
     return id||"support_group_01"
    }catch(e){
        console.log("group id not get -->",e)

    }
}