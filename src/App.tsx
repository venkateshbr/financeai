import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RoleSelection from "./pages/RoleSelection";
import ClientLayout from "./layout/ClientLayout";
import InternalLayout from "./layout/InternalLayout";
import ClientDashboard from "./features/client/ClientDashboard";
import ClientDocuments from "./features/client/ClientDocuments";
import ClientProfile from "./features/client/ClientProfile";
import InternalDashboard from "./features/internal/InternalDashboard";
import InternalReview from "./features/internal/InternalReview";
import InvoiceReviewDetail from "./features/internal/InvoiceReviewDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelection />} />

        {/* Client Routes */}
        <Route path="/client" element={<ClientLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="documents" element={<ClientDocuments />} />
          <Route path="profile" element={<ClientProfile />} />
        </Route>

        <Route path="/internal" element={<InternalLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<InternalDashboard />} />
          <Route path="reviews" element={<InternalReview />} />
          <Route path="reviews/:id" element={<InvoiceReviewDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
