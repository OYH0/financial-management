
import React from 'react';
import Dashboard from '../components/Dashboard';

console.log('Index.tsx loading...');

const Index = () => {
  console.log('Index component rendering...');
  
  try {
    return <Dashboard />;
  } catch (error) {
    console.error('Error in Index component:', error);
    return <div>Error loading dashboard</div>;
  }
};

export default Index;
