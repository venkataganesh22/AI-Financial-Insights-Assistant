import React from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export function CategoryPieChart({ categoryBreakdown }) {
  if (!categoryBreakdown || Object.keys(categoryBreakdown).length === 0) {
    return <div style={{ color: '#A1A1A1', fontSize: '0.85rem', textAlign: 'center', marginTop: '40px' }}>No category spending data</div>;
  }

  const data = Object.entries(categoryBreakdown).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
          contentStyle={{ backgroundColor: '#1C1C1C', borderColor: '#333', color: '#FFF', borderRadius: '8px' }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '0.78rem', color: '#A1A1A1' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MonthlyTrendChart({ monthlyTrends }) {
  if (!monthlyTrends || monthlyTrends.length === 0) {
    return <div style={{ color: '#A1A1A1', fontSize: '0.85rem', textAlign: 'center', marginTop: '40px' }}>No monthly trend data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={monthlyTrends}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
        <XAxis dataKey="month" stroke="#A1A1A1" fontSize={12} />
        <YAxis stroke="#A1A1A1" fontSize={12} tickFormatter={(val) => `₹${val/1000}k`} />
        <Tooltip 
          formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
          contentStyle={{ backgroundColor: '#1C1C1C', borderColor: '#333', color: '#FFF', borderRadius: '8px' }}
        />
        <Legend wrapperStyle={{ fontSize: '0.78rem', color: '#A1A1A1' }} />
        <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
