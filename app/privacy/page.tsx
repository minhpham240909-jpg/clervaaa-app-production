import { Shield, Eye, Lock, Users, Download, AlertCircle, CheckCircle } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className='min-h-screen bg-white'>
      {/* Hero Section */}
      <section className='py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-50 to-secondary-50'>
        <div className='max-w-4xl mx-auto text-center'>
          <Shield className='h-16 w-16 text-primary-600 mx-auto mb-6' />
          <h1 className='text-4xl sm:text-5xl font-bold font-heading text-neutral-900 mb-6'>
            Privacy Policy
          </h1>
          <p className='text-xl text-neutral-600 max-w-3xl mx-auto'>
            As a startup, we take your privacy seriously. This policy explains how we collect, use, and protect your information 
            as we build Clerva together.
          </p>
          <div className='mt-8 text-sm text-neutral-500'>
            <p>Last updated: December 2024</p>
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className='py-16 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='bg-primary-50 rounded-lg p-8 mb-16'>
            <h2 className='text-2xl font-bold font-heading text-neutral-900 mb-6 flex items-center'>
              <CheckCircle className='h-6 w-6 text-primary-600 mr-3' />
              Privacy at a Glance
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h3 className='font-semibold text-neutral-900 mb-2'>What we collect:</h3>
                <ul className='text-neutral-700 space-y-1'>
                  <li>• Profile info (name, university, subjects)</li>
                  <li>• Study preferences and schedule</li>
                  <li>• Messages and session data</li>
                  <li>• Usage analytics (anonymous)</li>
                </ul>
              </div>
              <div>
                <h3 className='font-semibold text-neutral-900 mb-2'>What we don\'t do:</h3>
                <ul className='text-neutral-700 space-y-1'>
                  <li>• Sell your personal information</li>
                  <li>• Share academic performance externally</li>
                  <li>• Track you outside Clerva</li>
                  <li>• Store payment info (handled by Stripe)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className='py-0 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='prose prose-lg max-w-none'>
            
            {/* Information We Collect */}
            <div className='mb-12'>
              <h2 className='text-2xl font-bold font-heading text-neutral-900 mb-6 flex items-center'>
                <Eye className='h-6 w-6 text-primary-600 mr-3' />
                Information We Collect
              </h2>
              
              <div className='space-y-6'>
                <div>
                  <h3 className='text-lg font-semibold text-neutral-900 mb-3'>Information You Provide</h3>
                  <ul className='space-y-2 text-neutral-700'>
                    <li><strong>Account Information:</strong> Name, email address, university affiliation, profile photo</li>
                    <li><strong>Academic Profile:</strong> Subjects of study, skill levels, academic year, study goals</li>
                    <li><strong>Study Preferences:</strong> Learning style, availability, preferred meeting locations, study methods</li>
                    <li><strong>Communication:</strong> Messages sent through our platform, study session notes, feedback and reviews</li>
                    <li><strong>Support Interactions:</strong> Help requests, bug reports, feature suggestions</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className='text-lg font-semibold text-neutral-900 mb-3'>Information We Collect Automatically</h3>
                  <ul className='space-y-2 text-neutral-700'>
                    <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform, session frequency</li>
                    <li><strong>Device Information:</strong> Browser type, operating system, IP address, device identifiers</li>
                    <li><strong>Study Analytics:</strong> Session duration, matching success rates, progress metrics (aggregated)</li>
                    <li><strong>Performance Data:</strong> App performance, error logs, crash reports (anonymized)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className='text-lg font-semibold text-neutral-900 mb-3'>Information From Third Parties</h3>
                  <ul className='space-y-2 text-neutral-700'>
                    <li><strong>Authentication Providers:</strong> Basic profile info from Google, GitHub, or university SSO</li>
                    <li><strong>Calendar Services:</strong> Availability data from connected calendar apps (with permission)</li>
                    <li><strong>University Verification:</strong> Academic status confirmation through official channels</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How We Use Information */}
            <div className='mb-12'>
              <h2 className='text-2xl font-bold font-heading text-neutral-900 mb-6 flex items-center'>
                <Users className='h-6 w-6 text-primary-600 mr-3' />
                How We Use Your Information
              </h2>
              
              <div className='space-y-4 text-neutral-700'>
                <div>
                  <h3 className='text-lg font-semibold text-neutral-900 mb-2'>Core Platform Functions</h3>
                  <ul className='space-y-2'>
                    <li>• Match you with compatible study partners based on your preferences</li>
                    <li>• Enable communication and collaboration with your study network</li>
                    <li>• Provide personalized study recommendations and insights</li>
                    <li>• Track your academic progress and celebrate achievements</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className='text-lg font-semibold text-neutral-900 mb-2'>Platform Improvement</h3>
                  <ul className='space-y-2'>
                    <li>• Analyze usage patterns to enhance matching algorithms</li>
                    <li>• Identify and fix technical issues for better user experience</li>
                    <li>• Develop new features based on community needs and feedback</li>
                    <li>• Conduct research on effective collaborative learning methods</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className='text-lg font-semibold text-neutral-900 mb-2'>Safety & Security</h3>
                  <ul className='space-y-2'>
                    <li>• Verify student identities to maintain a trusted academic community</li>
                    <li>• Monitor for inappropriate behavior and enforce community guidelines</li>
                    <li>• Detect and prevent fraud, spam, or malicious activities</li>
                    <li>• Respond to legal requests and protect user rights</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className='text-lg font-semibold text-neutral-900 mb-2'>Communication</h3>
                  <ul className='space-y-2'>
                    <li>• Send important account and security notifications</li>
                    <li>• Provide customer support and respond to your questions</li>
                    <li>• Share product updates and new feature announcements (optional)</li>
                    <li>• Deliver educational content and study tips (with your consent)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Information Sharing */}
            <div className='mb-12'>
              <h2 className='text-2xl font-bold font-heading text-neutral-900 mb-6 flex items-center'>
                <Lock className='h-6 w-6 text-primary-600 mr-3' />
                How We Share Information
              </h2>
              
              <div className='bg-accent-50 rounded-lg p-6 mb-6'>
                <div className='flex items-start'>
                  <CheckCircle className='h-5 w-5 text-accent-600 mt-0.5 mr-3 flex-shrink-0' />
                  <div>
                    <p className='font-medium text-accent-900 mb-1'>We Never Sell Your Data</p>
                    <p className='text-accent-700'>Clerva will never sell, rent, or trade your personal information to third parties for marketing purposes.</p>
                  </div>
                </div>
              </div>
              
              <div className='space-y-4 text-neutral-700'>
                <div>
                  <h3 className='text-lg font-semibold text-neutral-900 mb-2'>With Other Students</h3>
                  <p>We share limited profile information with potential study partners to enable meaningful connections:</p>
                  <ul className='mt-2 space-y-1'>
                    <li>• Basic profile info (name, university, subjects, study preferences)</li>
                    <li>• Availability and general location for in-person meetups</li>
                    <li>• Study reviews and reputation scores from past partnerships</li>
                    <li>• Any information you choose to include in your public profile</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className='text-lg font-semibold text-neutral-900 mb-2'>With Service Providers</h3>
                  <p>We work with trusted third parties to provide our services:</p>
                  <ul className='mt-2 space-y-1'>
                    <li>• <strong>Cloud hosting:</strong> Secure cloud providers for data storage</li>
                    <li>• <strong>Analytics:</strong> Basic usage analytics (anonymized)</li>
                    <li>• <strong>Communication:</strong> Email service providers for notifications</li>
                    <li>• <strong>Customer support:</strong> Support tools for user assistance</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className='text-lg font-semibold text-neutral-900 mb-2'>Legal Requirements</h3>
                  <p>We may disclose information when required by law:</p>
                  <ul className='mt-2 space-y-1'>
                    <li>• In response to valid legal process (subpoenas, court orders)</li>
                    <li>• To protect the safety of our users or the general public</li>
                    <li>• To investigate potential violations of our Terms of Service</li>
                    <li>• In connection with a business transfer or acquisition</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Your Privacy Rights */}
            <div className='mb-12'>
              <h2 className='text-2xl font-bold font-heading text-neutral-900 mb-6 flex items-center'>
                <Download className='h-6 w-6 text-primary-600 mr-3' />
                Your Privacy Rights
              </h2>
              
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='card p-6'>
                  <h3 className='font-semibold text-neutral-900 mb-3'>Access & Portability</h3>
                  <p className='text-neutral-600 mb-4'>You can view and download all your personal data through your account settings.</p>
                  <button className='btn-outline text-sm'>Download My Data</button>
                </div>
                
                <div className='card p-6'>
                  <h3 className='font-semibold text-neutral-900 mb-3'>Correction & Updates</h3>
                  <p className='text-neutral-600 mb-4'>Update your profile information anytime to keep your data accurate and current.</p>
                  <button className='btn-outline text-sm'>Update Profile</button>
                </div>
                
                <div className='card p-6'>
                  <h3 className='font-semibold text-neutral-900 mb-3'>Delete Account</h3>
                  <p className='text-neutral-600 mb-4'>Permanently delete your account and all associated data with our one-click deletion tool.</p>
                  <button className='btn-outline text-sm'>Delete Account</button>
                </div>
                
                <div className='card p-6'>
                  <h3 className='font-semibold text-neutral-900 mb-3'>Communication Preferences</h3>
                  <p className='text-neutral-600 mb-4'>Control what emails you receive and how we communicate with you.</p>
                  <button className='btn-outline text-sm'>Manage Preferences</button>
                </div>
              </div>
              
              <div className='mt-8 p-6 bg-blue-50 rounded-lg'>
                <h3 className='font-semibold text-blue-900 mb-2'>GDPR & CCPA Compliance</h3>
                <p className='text-blue-700'>
                  We comply with GDPR, CCPA, and other privacy regulations. EU and California residents have additional rights 
                  including the right to object to processing, restrict processing, and request detailed information about data handling.
                </p>
              </div>
            </div>

            {/* Data Security */}
            <div className='mb-12'>
              <h2 className='text-2xl font-bold font-heading text-neutral-900 mb-6 flex items-center'>
                <Shield className='h-6 w-6 text-primary-600 mr-3' />
                Data Security & Retention
              </h2>
              
              <div className='space-y-6 text-neutral-700'>
                <div>
                  <h3 className='text-lg font-semibold text-neutral-900 mb-2'>Security Measures</h3>
                  <ul className='space-y-2'>
                    <li>• <strong>Encryption:</strong> All data encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
                    <li>• <strong>Authentication:</strong> Multi-factor authentication and secure session management</li>
                    <li>• <strong>Access Control:</strong> Strict role-based access with regular security audits</li>
                    <li>• <strong>Infrastructure:</strong> SOC 2 Type II certified hosting with AWS security standards</li>
                    <li>• <strong>Monitoring:</strong> 24/7 security monitoring and incident response procedures</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className='text-lg font-semibold text-neutral-900 mb-2'>Data Retention</h3>
                  <ul className='space-y-2'>
                    <li>• <strong>Active accounts:</strong> Data retained while your account is active</li>
                    <li>• <strong>Inactive accounts:</strong> Data deleted after 2 years of inactivity</li>
                    <li>• <strong>Deleted accounts:</strong> 30-day recovery period, then permanent deletion</li>
                    <li>• <strong>Messages:</strong> Retained for 1 year after study partnership ends</li>
                    <li>• <strong>Analytics data:</strong> Aggregated data retained for 3 years for research</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className='text-lg font-semibold text-neutral-900 mb-2'>Breach Notification</h3>
                  <p>
                    In the unlikely event of a data breach affecting your personal information, we will notify you 
                    within 72 hours via email and provide detailed information about what happened, what data was 
                    involved, and what steps we\'re taking to resolve the issue.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact & Updates */}
            <div className='mb-12'>
              <h2 className='text-2xl font-bold font-heading text-neutral-900 mb-6 flex items-center'>
                <AlertCircle className='h-6 w-6 text-primary-600 mr-3' />
                Policy Updates & Contact
              </h2>
              
              <div className='space-y-6 text-neutral-700'>
                <div>
                  <h3 className='text-lg font-semibold text-neutral-900 mb-2'>Policy Changes</h3>
                  <p>
                    We may update this privacy policy as our service evolves or as required by law. Material changes 
                    will be communicated via email and through prominent notices in the app. We encourage you to review 
                    this policy periodically to stay informed about how we protect your information.
                  </p>
                </div>
                
                <div>
                  <h3 className='text-lg font-semibold text-neutral-900 mb-2'>Contact Us</h3>
                  <p className='mb-4'>
                    Questions about this privacy policy or how we handle your data? We\'re here to help:
                  </p>
                  <div className='bg-neutral-50 rounded-lg p-4'>
                    <p><strong>Email:</strong> hello@studybuddy.com</p>
                    <p><strong>Contact:</strong> We're a small team, so please be patient with our response times</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>
    </div>
  )
}