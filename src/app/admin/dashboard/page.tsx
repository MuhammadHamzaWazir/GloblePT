"use client";

import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

export default function AdminDashboard() {
  const [userStats, setUserStats] = useState({ admin: 0, staff: 0, assistant: 0, customer: 0 });
  const [prescriptionStats, setPrescriptionStats] = useState({ pending: 0, processing: 0, delivered: 0 });
  const [paymentStats, setPaymentStats] = useState({ paid: 0, unpaid: 0 });

  useEffect(() => {
    fetch('/api/users').then(res => res.json()).then((users: any[]) => {
      const stats = { admin: 0, staff: 0, assistant: 0, customer: 0 };
      users.forEach((u: any) => {
        const role = (u.role?.name || u.role) as keyof typeof stats;
        if (role in stats) stats[role]++;
      });
      setUserStats(stats);
    });
    fetch('/api/prescriptions').then(res => res.json()).then((prescriptions: any[]) => {
      const pStats = { pending: 0, processing: 0, delivered: 0 };
      const payStats = { paid: 0, unpaid: 0 };
      prescriptions.forEach((rx: any) => {
        const status = rx.status as keyof typeof pStats;
        const pay = rx.paymentStatus as keyof typeof payStats;
        if (status in pStats) pStats[status]++;
        if (pay in payStats) payStats[pay]++;
      });
      setPrescriptionStats(pStats);
      setPaymentStats(payStats);
    });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-semibold mb-2">User Roles</h3>
          <Pie data={{
            labels: ['Admin', 'Staff', 'Assistant', 'Customer'],
            datasets: [{
              data: [userStats.admin, userStats.staff, userStats.assistant, userStats.customer],
              backgroundColor: ['#2563eb', '#22d3ee', '#f59e42', '#10b981'],
            }],
          }} />
        </div>
        <div>
          <h3 className="font-semibold mb-2">Prescription Status</h3>
          <Bar data={{
            labels: ['Pending', 'Processing', 'Delivered'],
            datasets: [{
              label: 'Prescriptions',
              data: [prescriptionStats.pending, prescriptionStats.processing, prescriptionStats.delivered],
              backgroundColor: ['#f59e42', '#2563eb', '#10b981'],
            }],
          }} />
        </div>
        <div>
          <h3 className="font-semibold mb-2">Payment Status</h3>
          <Pie data={{
            labels: ['Paid', 'Unpaid'],
            datasets: [{
              data: [paymentStats.paid, paymentStats.unpaid],
              backgroundColor: ['#10b981', '#ef4444'],
            }],
          }} />
        </div>
      </div>
    </div>
  );
}
