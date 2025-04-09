import{Bar} from "react-chartjs-2"
import{
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title, 
    Tooltip,
    Legend,
    scales
} from "chart.js"
import { barChartData } from "../Data"

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title, 
    Tooltip,
    Legend
)
export const BookChart=()=>{
    const option={
       
    }
    return(
        <>
        <Bar options={option} data={barChartData}/>
        </>
    )
}