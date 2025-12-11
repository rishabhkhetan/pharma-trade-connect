import AnimatedContainer from "../components/ui/AnimatedContainer";
import PageHeader from "../components/ui/PageHeader";
import OrderHistoryTable from "../components/functional/OrderHistoryTable";
import Skeleton from "../components/ui/Skeleton";

export default function OrderHistory() {
  const loading: boolean = false; // replace with API state later

  return (
    <AnimatedContainer>
      <div className="max-w-6xl mx-auto p-8">

        <PageHeader
          title="Order History"
          subtitle="Order List"
        />

        {loading ? <Skeleton /> : <OrderHistoryTable />}
      </div>
    </AnimatedContainer>
  );
}
