import RequestForm from '../components/RequestForm';
import RequestList from '../components/RequestList';
import { useState } from 'react';

export default function Home() {
  const [refresh, setRefresh] = useState(false);
  return (
    <div>
      <h1>ระบบขออนุญาตลาหยุด</h1>
      <RequestForm onSuccess={()=>setRefresh(r=>!r)} />
      <RequestList key={refresh} />
    </div>
  );
}