import { FileText, Users, Shield, AlertTriangle, Scale, CheckCircle, XCircle } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className='min-h-screen bg-white'>
      {/* Hero Section */}
      <section className='py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-50 to-secondary-50'>
        <div className='max-w-4xl mx-auto text-center'>
          <FileText className='h-16 w-16 text-primary-600 mx-auto mb-6' />
          <h1 className='text-4xl sm:text-5xl font-bold font-heading text-neutral-900 mb-6'>
            Terms of Service
          </h1>
          <p className='text-xl text-neutral-600 max-w-3xl mx-auto'>
            As a startup, we're building Clerva with our community. These terms help us create a safe, 
            productive learning environment as we grow together.
          </p>
          <div className='mt-8 text-sm text-neutral-500'>
            <p>Last updated: December 2024</p>
          </div>
        </div>
      </section>

      {/* Quick Overview */}
      <section className='py-16 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='bg-primary-50 rounded-lg p-8 mb-16'>
            <h2 className='text-2xl font-bold font-heading text-neutral-900 mb-6 flex items-center'>
              <CheckCircle className='h-6 w-6 text-primary-600 mr-3' />
              Terms Summary (Not Legal Advice)
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h3 className='font-semibold text-neutral-900 mb-2 text-green-700'>✓ You Can:</h3>
                <ul className='text-neutral-700 space-y-1'>
                  <li>• Use Clerva for legitimate academic purposes</li>
                  <li>• Connect with other verified students</li>
                  <li>• Share appropriate study materials</li>
                  <li>• Provide honest feedback and reviews</li>
                  <li>• Provide feedback to help us improve</li>
                </ul>
              </div>
              <div>
                <h3 className='font-semibold text-neutral-900 mb-2 text-red-700'>✗ You Cannot:</h3>
                <ul className='text-neutral-700 space-y-1'>
                  <li>• Use the platform for non-academic purposes</li>
                  <li>• Share inappropriate content or harass others</li>
                  <li>• Create fake profiles or impersonate others</li>
                  <li>• Violate intellectual property rights</li>
                  <li>• Attempt to hack or disrupt our services</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Terms Content */}
      <section className='py-0 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto'>
          
          {/* Acceptance of Terms */}
          <div className='mb-12'>
            <h2 className='text-2xl font-bold font-heading text-neutral-900 mb-6 flex items-center'>
              <Scale className='h-6 w-6 text-primary-600 mr-3' />
              1. Acceptance of Terms
            </h2>
            <div className='prose prose-lg text-neutral-700'>
              <p>
                By accessing or using Clerva ("the Service"), you agree to be bound by these Terms of Service 
                ("Terms"). If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p>
                These Terms apply to all visitors, users, and others who access or use the Service. Clerva is 
                operated by Clerva Inc. ("we," "us," or "our").
              </p>
              <p>
                You must be at least 13 years old to use this Service. If you are under 18, you must have your 
                parent or guardian's permission to use Clerva.
              </p>
            </div>
          </div>

          {/* Service Description */}
          <div className='mb-12'>
            <h2 className='text-2xl font-bold font-heading text-neutral-900 mb-6 flex items-center'>
              <Users className='h-6 w-6 text-primary-600 mr-3' />
              2. Description of Service
            </h2>
            <div className='prose prose-lg text-neutral-700'>
              <p>
                Clerva is an online platform that connects students with compatible study partners and provides 
                tools for collaborative learning. Our services include:
              </p>
              <ul>
                <li>AI-powered matching algorithms to connect compatible study partners</li>
                <li>Communication tools including messaging, video calls, and file sharing</li>
                <li>Study session scheduling and management tools</li>
                <li>Progress tracking and analytics for individual and group learning</li>
                <li>Study group creation and management features</li>
                <li>Peer review and reputation systems</li>
              </ul>
              <p>
                We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, 
                with or without notice.
              </p>
            </div>
          </div>

          {/* User Accounts */}
          <div className='mb-12'>
            <h2 className='text-2xl font-bold font-heading text-neutral-900 mb-6 flex items-center'>
              <Shield className='h-6 w-6 text-primary-600 mr-3' />
              3. User Accounts and Responsibilities
            </h2>
            <div className='prose prose-lg text-neutral-700'>
              <h3 className='text-lg font-semibold text-neutral-900 mb-3'>Account Creation</h3>
              <ul>
                <li>You must provide accurate and complete information when creating your account</li>
                <li>You are responsible for maintaining the security of your account and password</li>
                <li>You must be a current student or recent graduate to use academic features</li>
                <li>One person may not maintain multiple accounts</li>
              </ul>

              <h3 className='text-lg font-semibold text-neutral-900 mb-3 mt-6'>Student Verification</h3>
              <ul>
                <li>We may require verification of your student status through official channels</li>
                <li>Providing false information about your academic status may result in account termination</li>
                <li>You must update your profile if your academic status changes</li>
              </ul>

              <h3 className='text-lg font-semibold text-neutral-900 mb-3 mt-6'>Account Security</h3>
              <ul>
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must immediately notify us of any unauthorized access or security breach</li>
                <li>You must not share your account credentials with others</li>
              </ul>
            </div>
          </div>

          {/* Acceptable Use */}
          <div className='mb-12'>
            <h2 className='text-2xl font-bold font-heading text-neutral-900 mb-6 flex items-center'>
              <CheckCircle className='h-6 w-6 text-primary-600 mr-3' />
              4. Acceptable Use Policy
            </h2>
            <div className='prose prose-lg text-neutral-700'>
              <div className='bg-green-50 rounded-lg p-6 mb-6'>
                <h3 className='text-lg font-semibold text-green-900 mb-3'>✓ Encouraged Activities</h3>
                <ul className='text-green-700 space-y-2'>
                  <li>• Engaging in genuine academic collaboration and learning</li>
                  <li>• Sharing appropriate study materials and resources</li>
                  <li>• Providing constructive feedback and peer support</li>
                  <li>• Maintaining respectful communication with all users</li>
                  <li>• Reporting inappropriate behavior or content</li>
                </ul>
              </div>

              <div className='bg-red-50 rounded-lg p-6'>
                <h3 className='text-lg font-semibold text-red-900 mb-3'>✗ Prohibited Activities</h3>
                <ul className='text-red-700 space-y-2'>
                  <li>• Using the platform for romantic dating or non-academic social networking</li>
                  <li>• Harassment, bullying, discrimination, or hate speech of any kind</li>
                  <li>• Sharing inappropriate, offensive, or illegal content</li>
                  <li>• Plagiarism, cheating, or academic dishonesty</li>
                  <li>• Spamming, advertising, or promoting non-educational services</li>
                  <li>• Attempting to hack, disrupt, or compromise platform security</li>
                  <li>• Creating fake profiles or impersonating others</li>
                  <li>• Collecting or harvesting user information for external purposes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Content Policy */}
          <div className='mb-12'>
            <h2 className='text-2xl font-bold font-heading text-neutral-900 mb-6 flex items-center'>
              <FileText className='h-6 w-6 text-primary-600 mr-3' />
              5. Content and Intellectual Property
            </h2>
            <div className='prose prose-lg text-neutral-700'>
              <h3 className='text-lg font-semibold text-neutral-900 mb-3'>Your Content</h3>
              <ul>
                <li>You retain ownership of content you create and share on Clerva</li>
                <li>By posting content, you grant us a non-exclusive license to host, display, and distribute it within the platform</li>
                <li>You are responsible for ensuring you have the right to share all content you post</li>
                <li>You must respect the intellectual property rights of others</li>
              </ul>

              <h3 className='text-lg font-semibold text-neutral-900 mb-3 mt-6'>Our Content</h3>
              <ul>
                <li>Clerva owns all rights to the platform, including software, design, and trademarks</li>
                <li>You may not copy, modify, distribute, or reverse engineer any part of our platform</li>
                <li>We provide our service "as is" without warranties of any kind</li>
              </ul>

              <h3 className='text-lg font-semibold text-neutral-900 mb-3 mt-6'>Copyright Policy</h3>
              <p>
                We respect intellectual property rights and expect our users to do the same. If you believe content 
                on Clerva infringes your copyright, please contact us at copyright@studybuddy.com with detailed 
                information about the alleged infringement.
              </p>
            </div>
          </div>


          {/* Privacy and Data */}
          <div className='mb-12'>
            <h2 className='text-2xl font-bold font-heading text-neutral-900 mb-6 flex items-center'>
              <Shield className='h-6 w-6 text-primary-600 mr-3' />
              6. Privacy and Data Protection
            </h2>
            <div className='prose prose-lg text-neutral-700'>
              <p>
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect 
                your information. By using Clerva, you also agree to our Privacy Policy.
              </p>
              <p>
                Key privacy principles include:
              </p>
              <ul>
                <li>We never sell your personal information to third parties</li>
                <li>We use your data only to provide and improve our services</li>
                <li>You control what information is shared with other students</li>
                <li>You can delete your account and data at any time</li>
                <li>We comply with GDPR, CCPA, and other applicable privacy laws</li>
              </ul>
              <p>
                For complete details, please read our <a href='/privacy' className='text-primary-600 hover:text-primary-700'>Privacy Policy</a>.
              </p>
            </div>
          </div>

          {/* Platform Rules */}
          <div className='mb-12'>
            <h2 className='text-2xl font-bold font-heading text-neutral-900 mb-6 flex items-center'>
              <AlertTriangle className='h-6 w-6 text-primary-600 mr-3' />
              7. Community Guidelines and Enforcement
            </h2>
            <div className='prose prose-lg text-neutral-700'>
              <h3 className='text-lg font-semibold text-neutral-900 mb-3'>Community Standards</h3>
              <p>Clerva is an academic community focused on learning and mutual support. We expect all users to:</p>
              <ul>
                <li>Treat others with respect and kindness</li>
                <li>Focus on academic collaboration and legitimate educational activities</li>
                <li>Provide honest, constructive feedback</li>
                <li>Report inappropriate behavior or content</li>
                <li>Respect different learning styles, backgrounds, and perspectives</li>
              </ul>

              <h3 className='text-lg font-semibold text-neutral-900 mb-3 mt-6'>Enforcement Actions</h3>
              <p>Violations of these Terms or our Community Guidelines may result in:</p>
              <ul>
                <li><strong>Warning:</strong> First-time minor violations</li>
                <li><strong>Temporary suspension:</strong> Repeated violations or moderate misconduct</li>
                <li><strong>Permanent ban:</strong> Severe violations, harassment, or illegal activity</li>
                <li><strong>Legal action:</strong> For illegal activities or severe policy violations</li>
              </ul>

              <h3 className='text-lg font-semibold text-neutral-900 mb-3 mt-6'>Appeals Process</h3>
              <p>
                If you believe enforcement action was taken in error, you can appeal by contacting our support team 
                at appeals@studybuddy.com within 30 days of the action.
              </p>
            </div>
          </div>

          {/* Disclaimers */}
          <div className='mb-12'>
            <h2 className='text-2xl font-bold font-heading text-neutral-900 mb-6 flex items-center'>
              <XCircle className='h-6 w-6 text-primary-600 mr-3' />
              8. Disclaimers and Limitations
            </h2>
            <div className='prose prose-lg text-neutral-700'>
              <div className='bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6'>
                <p className='text-yellow-800'>
                  <strong>Important:</strong> Clerva provides a platform for student connections but does not guarantee 
                  academic outcomes, successful partnerships, or specific results from using our service.
                </p>
              </div>

              <h3 className='text-lg font-semibold text-neutral-900 mb-3'>Service Disclaimers</h3>
              <ul>
                <li>We provide our service "as is" and "as available" without warranties of any kind</li>
                <li>We do not guarantee uninterrupted or error-free service</li>
                <li>We are not responsible for the conduct of other users on or off the platform</li>
                <li>We do not verify the accuracy of user-generated content or academic credentials beyond basic verification</li>
                <li>Users are responsible for their own safety when meeting study partners in person</li>
              </ul>

              <h3 className='text-lg font-semibold text-neutral-900 mb-3 mt-6'>Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, Clerva shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including loss of profits, data, use, goodwill, or other 
                intangible losses resulting from your use of the service.
              </p>
            </div>
          </div>

          {/* Termination */}
          <div className='mb-12'>
            <h2 className='text-2xl font-bold font-heading text-neutral-900 mb-6 flex items-center'>
              <AlertTriangle className='h-6 w-6 text-primary-600 mr-3' />
              9. Termination
            </h2>
            <div className='prose prose-lg text-neutral-700'>
              <h3 className='text-lg font-semibold text-neutral-900 mb-3'>Your Right to Terminate</h3>
              <ul>
                <li>You may terminate your account at any time through your account settings</li>
                <li>You may also contact our support team to request account deletion</li>
                <li>Upon termination, your account will enter a 30-day recovery period before permanent deletion</li>
              </ul>

              <h3 className='text-lg font-semibold text-neutral-900 mb-3 mt-6'>Our Right to Terminate</h3>
              <ul>
                <li>We may suspend or terminate accounts that violate these Terms</li>
                <li>We may terminate accounts involved in fraud, harassment, or illegal activity</li>
                <li>We may discontinue the service with reasonable notice to users</li>
              </ul>

              <h3 className='text-lg font-semibold text-neutral-900 mb-3 mt-6'>Effect of Termination</h3>
              <ul>
                <li>All rights to use the service immediately cease upon termination</li>
                <li>Your data will be deleted according to our data retention policies</li>
                <li>Provisions related to intellectual property, disclaimers, and dispute resolution survive termination</li>
              </ul>
            </div>
          </div>

          {/* Legal Terms */}
          <div className='mb-12'>
            <h2 className='text-2xl font-bold font-heading text-neutral-900 mb-6 flex items-center'>
              <Scale className='h-6 w-6 text-primary-600 mr-3' />
              10. Legal and Miscellaneous
            </h2>
            <div className='prose prose-lg text-neutral-700'>
              <h3 className='text-lg font-semibold text-neutral-900 mb-3'>Governing Law</h3>
              <p>
                These Terms are governed by the laws of the State of California, United States, without regard to 
                conflict of law principles.
              </p>

              <h3 className='text-lg font-semibold text-neutral-900 mb-3 mt-6'>Dispute Resolution</h3>
              <p>
                Any disputes arising from these Terms or your use of Clerva will be resolved through binding 
                arbitration rather than in court, except that you may assert claims in small claims court if they qualify.
              </p>

              <h3 className='text-lg font-semibold text-neutral-900 mb-3 mt-6'>Changes to Terms</h3>
              <p>
                We may update these Terms from time to time. Material changes will be communicated via email and 
                through prominent notices in the app. Continued use of Clerva after changes constitutes acceptance 
                of the new Terms.
              </p>

              <h3 className='text-lg font-semibold text-neutral-900 mb-3 mt-6'>Contact Information</h3>
              <div className='bg-neutral-50 rounded-lg p-4'>
                <p><strong>Clerva</strong></p>
                <p>Email: hello@studybuddy.com</p>
                <p>We're a small startup team, so please be patient with our response times</p>
              </div>
            </div>
          </div>

          {/* Acknowledgment */}
          <div className='bg-primary-50 rounded-lg p-8 mb-16'>
            <h2 className='text-xl font-bold font-heading text-neutral-900 mb-4'>Acknowledgment</h2>
            <p className='text-neutral-700'>
              By using Clerva, you acknowledge that you have read, understood, and agree to be bound by these 
              Terms of Service and our Privacy Policy. These Terms constitute the entire agreement between you and 
              Clerva regarding your use of the service.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}