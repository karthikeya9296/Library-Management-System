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
import { recordsChartData } from "../Data"

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title, 
    Tooltip,
    Legend
)

export const RecordChart=()=>{
    const option ={}
    return(
        <>
        <Bar options={option} data={recordsChartData}/>
        </>
    )
}