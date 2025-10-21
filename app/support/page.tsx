import { Header } from "@/components/layout/header";

export default function SupportPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="container py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Support</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Get help with SearchAF
            </p>

            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Contact Support</h2>
                <p className="text-muted-foreground">
                  Our support team is here to help. Reach out to us for any questions or issues.
                </p>
              </div>

              <div className="border rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Documentation</h2>
                <p className="text-muted-foreground">
                  Check out our comprehensive documentation for detailed guides and API references.
                </p>
              </div>

              <div className="border rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Community</h2>
                <p className="text-muted-foreground">
                  Join our community to connect with other developers and get answers to your questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
