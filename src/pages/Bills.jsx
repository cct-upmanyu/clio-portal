import Page from '../components/ui/Page'
import PageHeader from '../components/ui/PageHeader'
import PagePlaceholder from '../components/layout/PagePlaceholder'

function Bills() {
  return (
    <Page>
      <PageHeader title="Bills" description="Invoices and payments for this matter." />
      <PagePlaceholder>Invoices and payment history will appear here once billing is connected.</PagePlaceholder>
    </Page>
  )
}

export default Bills
