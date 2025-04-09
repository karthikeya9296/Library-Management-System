import{Line} from "react-chartjs-2"
import{
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title, 
    Tooltip,
    Legend,
    scales
} from "chart.js"
import { lineChartData } from "../Data"

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title, 
    Tooltip,
    Legend
)
export const LineGraph=()=>{
    const option={
       
    }

    // const data={}

    return(
        <>
        <Line options={option} data={lineChartData  }/>
        </>
    )
}