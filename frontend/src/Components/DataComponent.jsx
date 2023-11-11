import React, { useState } from "react";
import io from "socket.io-client";
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined';
import Container from '@mui/material/Container';


const socket = io("http://localhost:8080/", { // replace with your url
  transports: ["websocket"],
});

const DataComponent = () => {
  const [backendData, setBackendData] = useState([]);
  const [more, setLoadMore] = useState(9);

  function handleLoadMore () {
    setLoadMore(more+9);
  }

  socket.on("connect", () => {
    console.log("Connected to the server");
  });
  socket.on("data", (data) => {
    try {
      setBackendData((prevData) => [...prevData, data]);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from the server");
  });

  return (
    <>
    <Container component="main" >
     <h1><span style={{"color" : "limegreen"}}> {backendData.length} </span> </h1>
     <h3>Succesful Data Transmission and Decoding</h3>
    
    {backendData.length===0 ?  
    <>
      <Grid container spacing={2} sx={{
          '--Grid-borderWidth': '1px',
          borderTop: 'var(--Grid-borderWidth) solid',
          borderLeft: 'var(--Grid-borderWidth) solid',
          borderColor: 'divider',
          '& > div': {
            borderRight: 'var(--Grid-borderWidth) solid',
            borderBottom: 'var(--Grid-borderWidth) solid',
            borderColor: 'divider',
          },
        }}>
          <Grid xs={6} md={4}>
            <Skeleton className="MuiSkeleton-fitContent" variant="rectangular" height={118} />
          </Grid>
          <Grid xs={6} md={4}>
            <Skeleton className="MuiSkeleton-fitContent" variant="rectangular" height={118} />
          </Grid>
          <Grid xs={6} md={4}>
            <Skeleton className="MuiSkeleton-fitContent" variant="rectangular" height={118} />
          </Grid>
      </Grid> </>:
      <> 
      <Grid container spacing={2} sx={{
          '--Grid-borderWidth': '1px',
          borderTop: 'var(--Grid-borderWidth) solid',
          borderLeft: 'var(--Grid-borderWidth) solid',
          borderColor: 'divider',
          '& > div': {
            borderRight: 'var(--Grid-borderWidth) solid',
            borderBottom: 'var(--Grid-borderWidth) solid',
            borderColor: 'divider',
          },
        }}>
      

      {more <= backendData.length && backendData.slice(0,more).map((dataItem, index) => (
        <Grid xs={6} md={4} key={index}    >
          <p style={{ fontWeight: "bold" }}>Name: {dataItem.name}</p>
          <p>Origin: {dataItem.origin}</p>
          <p>Destination: {dataItem.destination}</p>
        </Grid>
      ))}
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'center' , margin:"50px"}}>
        
        <Button variant="outlined" onClick={handleLoadMore} color="success" endIcon={<CachedOutlinedIcon/>}>Load More</Button>
      </Box>
    </>
}
</Container>
</>
  );
};

export default DataComponent;
