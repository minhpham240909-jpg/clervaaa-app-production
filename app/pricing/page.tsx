import { Check, Star, Users, Zap, Crown, ArrowRight } from 'lucide-react'

const plans = [
  {
    name: 'Study Starter',
    price: 'Free',
    description: 'Perfect for trying collaborative learning',
    features: [
      'Find up to 3 study partners per month',
      'Basic messaging and file sharing',
      'Join up to 2 study groups',
      'Standard matching algorithm',
      'Basic progress tracking',
      'Email support'
    ],
    limitations: [
      'Limited to 10 hours of study session tracking per month',
      'Basic calendar integration only',
      'No priority matching'
    ],
    icon: Users,
    color: 'neutral',
    popular: false
  },
  {
    name: 'Study Pro',
    price: '$9.99',
    period: '/month',
    description: 'For serious students ready to excel',
    features: [
      'Unlimited study partner matching',
      'Advanced AI matching with personality analysis',
      'Create and join unlimited study groups',
      'Premium messaging with video calls',
      'Advanced progress analytics and insights',
      'Calendar sync with all major platforms',
      'Study session recordings and notes',
      'Priority customer support',
      'Goal setting and milestone tracking',
      'Focus timer and productivity tools'
    ],
    icon: Zap,
    color: 'primary',
    popular: true
  },
  {
    name: 'Study Elite',
    price: '$19.99',
    period: '/month',
    description: 'For academic leaders and serious achievers',
    features: [
      'Everything in Study Pro',
      'Personal AI study coach',
      'Unlimited cloud storage for study materials',
      'Advanced analytics and performance insights',
      'Priority matching (get matched first)',
      'White-label study groups for organizations',
      'Direct access to study method experts',
      '24/7 premium support',
      'Custom study plan generation',
      'Integration with university LMS systems',
      'Exclusive webinars and masterclasses',
      'Academic reputation portfolio'
    ],
    icon: Crown,
    color: 'secondary',
    popular: false
  }
]

const faqs = [
  {
    question: 'Can I change my plan anytime?',
    answer: 'Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately, and we\'ll prorate any charges.'
  },
  {
    question: 'Is there a student discount?',
    answer: 'Absolutely! Students get 50% off all paid plans with valid .edu email verification. We believe in making quality education accessible.'
  },
  {
    question: 'What happens to my data if I cancel?',
    answer: 'Your account remains active for 30 days after cancellation. You can export all your data, and we\'ll permanently delete it after the grace period unless you reactivate.'
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee on all paid plans. If you\'re not satisfied, we\'ll refund your payment in full, no questions asked.'
  }
]

export default function PricingPage() {
  return (
    <div className='min-h-screen bg-white'>
      {/* Hero Section */}
      <section className='py-20 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto text-center'>
          <h1 className='text-4xl sm:text-5xl font-bold font-heading text-neutral-900 mb-6'>
            Choose Your Academic
            <span className='text-gradient block'>Success Plan</span>
          </h1>
          <p className='text-xl text-neutral-600 max-w-3xl mx-auto'>
            Every plan transforms how you study. Start free, upgrade when you\'re ready to unlock your full academic potential.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className='py-20 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {plans.map((plan, index) => {
              const Icon = plan.icon
              const isPopular = plan.popular
              const colorClasses: Record<string, string> = {
                neutral: 'border-neutral-200',
                primary: 'border-primary-500 ring-2 ring-primary-500',
                secondary: 'border-secondary-500'
              }
              
              return (
                <div key={index} className={`relative bg-white rounded-lg border-2 ${colorClasses[plan.color]} p-8 ${isPopular ? 'transform scale-105' : ''}`}>
                  {isPopular && (
                    <div className='absolute -top-3 left-1/2 transform -translate-x-1/2'>
                      <div className='bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center'>
                        <Star className='h-4 w-4 mr-1' />
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <div className='text-center mb-8'>
                    <div className={`bg-${plan.color}-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`h-8 w-8 text-${plan.color}-600`} />
                    </div>
                    <h3 className='text-2xl font-bold font-heading text-neutral-900 mb-2'>{plan.name}</h3>
                    <div className='mb-4'>
                      <span className='text-4xl font-bold text-neutral-900'>{plan.price}</span>
                      {plan.period && <span className='text-neutral-600'>{plan.period}</span>}
                    </div>
                    <p className='text-neutral-600'>{plan.description}</p>
                  </div>

                  <ul className='space-y-4 mb-8'>
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className='flex items-start'>
                        <Check className='h-5 w-5 text-accent-500 mt-0.5 mr-3 flex-shrink-0' />
                        <span className='text-neutral-700'>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.limitations && (
                    <div className='mb-8'>
                      <h4 className='text-sm font-medium text-neutral-500 mb-3'>Limitations:</h4>
                      <ul className='space-y-2'>
                        {plan.limitations.map((limitation, limitIndex) => (
                          <li key={limitIndex} className='text-sm text-neutral-500'>
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center ${
                    isPopular 
                      ? 'bg-primary-500 text-white hover:bg-primary-600' 
                      : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                  }`}>
                    {plan.price === 'Free' ? 'Get Started Free' : 'Start Free Trial'}
                    <ArrowRight className='ml-2 h-4 w-4' />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Student Discount Banner */}
      <section className='py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-accent-500 to-accent-600'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-3xl font-bold font-heading text-white mb-4'>
            Students Save 50% on All Plans
          </h2>
          <p className='text-xl text-accent-100 mb-6'>
            Verify your .edu email address and get instant access to premium features at student prices
          </p>
          <button className='bg-white text-accent-600 hover:bg-neutral-50 font-medium py-3 px-8 rounded-lg transition-colors duration-200'>
            Verify Student Status
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className='py-20 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl font-bold font-heading text-neutral-900 mb-4'>
              Frequently Asked Questions
            </h2>
            <p className='text-xl text-neutral-600'>
              Everything you need to know about Clerva pricing
            </p>
          </div>
          
          <div className='space-y-8'>
            {faqs.map((faq, index) => (
              <div key={index} className='card p-6'>
                <h3 className='text-lg font-semibold text-neutral-900 mb-3'>{faq.question}</h3>
                <p className='text-neutral-600'>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-3xl font-bold font-heading text-neutral-900 mb-4'>
            Ready to Transform Your Study Experience?
          </h2>
          <p className='text-xl text-neutral-600 mb-8'>
            Start with our free plan and upgrade when you\'re ready for more power
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <a 
              href='/signin' 
              className='btn-primary text-lg px-8 py-3 inline-flex items-center justify-center'
            >
              Start Free Trial
              <ArrowRight className='ml-2 h-5 w-5' />
            </a>
            <a 
              href='/features' 
              className='btn-outline text-lg px-8 py-3'
            >
              See All Features
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}