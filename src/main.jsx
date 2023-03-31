import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorPage from './error-page';
import './index.css';
import VbModel from './routes/vbModel';
import Index from './routes/index';
import Root from './routes/root';

// This is the root page of React, which also had the react router defined.

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        errorElement: <ErrorPage />, // common error page of all children
        children: [
          { index: true, element: <Index /> },
          {
            path: 'tools/vb-model',
            element: <VbModel />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
