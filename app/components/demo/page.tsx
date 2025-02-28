import { DataTableDemo } from "@/app/components/ui/data-table/demo"

export const metadata = {
  title: "Data Table Demo",
  description: "A demonstration of the reusable data table component",
}

export default function DemoPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Component Demos</h1>
      
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Data Table</h2>
          <p className="text-muted-foreground mb-6">
            A reusable data table component with sorting, filtering, pagination, and column visibility controls.
          </p>
          <div className="border rounded-lg p-6 bg-card">
            <DataTableDemo />
          </div>
        </section>
      </div>
    </div>
  )
} 