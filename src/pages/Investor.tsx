import { InvestorGate } from '@/sandbox/components/investor/InvestorGate';
import { InvestorConsole } from '@/sandbox/components/investor/InvestorConsole';

const Investor = () => (
  <InvestorGate>
    <InvestorConsole />
  </InvestorGate>
);

export default Investor;
