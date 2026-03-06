
import React from 'react';
import Dashboard from '../components/Dashboard';



const Index = () => {

  
  try {
    return <Dashboard />;
  } catch (error) {
    console.error('Error in Index component:', error);
    return <div>Error loading dashboard</div>;
  }
};

export default Index;
