import React from 'react'
import { LineGraph } from './UserChart'
import { BookChart } from './Bookchart'
import { RecordChart } from './piechart'
export default function ChartData() {
  return (
    <>
    {/* <div className="chart"> */}

    <div className='chart-item' style={{width:"100%",fontSize:"50px"}}>
    <div style={{width:"30%",margin:"80px"}}>
<center>        <h1>User</h1>
</center>    <LineGraph />
    </div>
    <div style={{width:"30%",margin:"80px"}}>
<center>    <h1>Books</h1>
</center>
    <BookChart/>

    </div>
 
    </div>
    <div style={{width:"30%",margin:"80px",fontSize:"50px"}}>
<center>    <h1>Records</h1>
</center>
    <RecordChart/>

    </div>
      
    {/* </div> */}
   
    </>
  )
}
