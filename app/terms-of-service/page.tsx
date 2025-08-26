
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settings
            </Button>
          </Link>
          
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
              <p className="text-gray-600 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Terms Content */}
        <Card>
          <CardHeader>
            <CardTitle>Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-8 text-gray-700">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
                <p className="mb-4">
                  By accessing and using CareerPath Pro, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Description of Service</h2>
                <p className="mb-4">
                  CareerPath Pro is a career and business guidance platform that provides:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Career guidance and resources</li>
                  <li>Job search assistance</li>
                  <li>Business opportunity information</li>
                  <li>Educational and training resources</li>
                  <li>Industry contacts and networking opportunities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">User Responsibilities</h2>
                <p className="mb-4">
                  As a user of our service, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate and truthful information</li>
                  <li>Keep your account credentials secure</li>
                  <li>Use the service for lawful purposes only</li>
                  <li>Respect intellectual property rights</li>
                  <li>Not abuse or misuse our platform</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription and Payments</h2>
                <p className="mb-4">
                  Our service offers both free and premium subscription tiers:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Free accounts have limited access to resources</li>
                  <li>Premium subscriptions provide unlimited access</li>
                  <li>Payments are processed securely through Stripe</li>
                  <li>Subscriptions renew automatically unless canceled</li>
                  <li>Refunds are handled according to our refund policy</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
                <p className="mb-4">
                  The service and its original content, features, and functionality are and will remain the exclusive property of CareerPath Pro and its licensors. The service is protected by copyright, trademark, and other laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Prohibited Uses</h2>
                <p className="mb-4">
                  You may not use our service:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>For any unlawful purpose or to solicit others to perform illegal acts</li>
                  <li>To violate any international, federal, provincial, or state regulations</li>
                  <li>To transmit harmful or malicious code</li>
                  <li>To collect or track personal information of other users</li>
                  <li>To spam, phish, or conduct fraudulent activities</li>
                  <li>To interfere with or circumvent security features</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Accuracy</h2>
                <p className="mb-4">
                  While we strive to provide accurate and up-to-date information, we cannot guarantee the completeness or accuracy of all content. Users should verify information independently before making career or business decisions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
                <p className="mb-4">
                  CareerPath Pro shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Termination</h2>
                <p className="mb-4">
                  We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason, including breach of these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
                <p className="mb-4">
                  We reserve the right to modify these terms at any time. We will notify users of any material changes by updating the "Last updated" date and posting a notice on our platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
                <p className="mb-4">
                  If you have any questions about these Terms of Service, please contact us through our support system or email us at support@careerpath.com.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
