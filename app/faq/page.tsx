'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Search, Users, Shield, Zap, CreditCard, HelpCircle } from 'lucide-react'

const faqCategories = [
  {
    icon: Users,
    title: 'Getting Started',
    faqs: [
      {
        question: 'How do I create my Clerva profile?',
        answer: 'Sign up with your email, then complete your profile by adding your subjects, study preferences, and learning style. We use this information to help you find study partners who match your needs.'
      },
      {
        question: 'How does the matching work?',
        answer: 'We match students based on subjects, study preferences, schedules, and learning styles. As a startup, we\'re constantly improving our matching based on user feedback.'
      },
      {
        question: 'Can I study with people from other universities?',
        answer: 'Absolutely! Clerva connects students across universities, colleges, and even self-learners. Many subjects transcend institutional boundaries, and diverse perspectives often enhance learning.'
      },
      {
        question: 'What if I don\'t like my matched study partners?',
        answer: 'No problem! You can politely decline partnerships, and our algorithm learns from your preferences. You can also provide feedback to improve future matches. There\'s no pressure to continue partnerships that aren\'t working.'
      }
    ]
  },
  {
    icon: Zap,
    title: 'Using Clerva',
    faqs: [
      {
        question: 'How do I schedule study sessions?',
        answer: 'Use our integrated calendar to propose times, and Clerva will automatically check everyone\'s availability. Partners can accept, propose alternatives, or add recurring sessions. We send reminders and prep notifications to keep everyone on track.'
      },
      {
        question: 'Can I create study groups instead of just pairs?',
        answer: 'Yes! You can create study groups of 3-8 members. Groups work great for exam prep, project collaboration, or ongoing subject support. You can manage group schedules, share resources, and track collective progress.'
      },
      {
        question: 'What study tools are available during sessions?',
        answer: 'Clerva includes integrated whiteboards, screen sharing, file sharing, voice/video calls, focus timers, note-taking tools, and recording capabilities (with permission). Everything you need for productive virtual or hybrid study sessions.'
      },
      {
        question: 'How do I track my study progress?',
        answer: 'Our analytics track your study hours, session quality ratings, subject mastery progression, goal achievement, and collaboration effectiveness. You\'ll see visual progress reports and get personalized recommendations for improvement.'
      }
    ]
  },
  {
    icon: Shield,
    title: 'Safety & Privacy',
    faqs: [
      {
        question: 'How do you verify that users are real students?',
        answer: 'We verify users through university email addresses, LinkedIn profiles, or academic documentation. Fake profiles are automatically flagged by our AI and manually reviewed. We maintain a safe, academic-focused community.'
      },
      {
        question: 'What information is shared with potential study partners?',
        answer: 'You control what\'s visible: name, university/program, subjects, study schedule, and brief bio are standard. Optional details include social media, phone number, or personal interests. Your academic performance and private messages are never shared.'
      },
      {
        question: 'How do you handle inappropriate behavior?',
        answer: 'We have zero tolerance for harassment, discrimination, or non-academic behavior. Users can report issues instantly, and we investigate all complaints within 24 hours. Confirmed violations result in immediate suspension or permanent bans.'
      },
      {
        question: 'Can I block or report users?',
        answer: 'Yes, you can block any user immediately, which prevents all future contact. Reporting sends the issue to our safety team with context. We take all reports seriously and investigate thoroughly to maintain a positive learning environment.'
      }
    ]
  },
  {
    icon: CreditCard,
    title: 'Pricing & Subscriptions',
    faqs: [
      {
        question: 'Is Clerva free?',
        answer: 'Yes! We\'re currently in beta and completely free. We want to focus on building the best product first, then we\'ll consider pricing options based on user feedback.'
      },
      {
        question: 'Will you charge in the future?',
        answer: 'We\'re focused on building the best product first. If we do introduce pricing, early users will get special discounts and we\'ll always keep a free tier available.'
      },
      {
        question: 'How can I provide feedback?',
        answer: 'We love feedback! You can reach out to us directly through our contact form or email. Your input helps us improve the platform for everyone.'
      },
      {
        question: 'What if I find bugs?',
        answer: 'Please report any bugs you find! We\'re a small team and appreciate your patience as we work to fix issues. Bug reports help us improve the platform for everyone.'
      }
    ]
  },
  {
    icon: HelpCircle,
    title: 'Technical Support',
    faqs: [
      {
        question: 'Which devices and browsers work with Clerva?',
        answer: 'Clerva works on any device with a web browser: laptops, tablets, and smartphones. We support Chrome, Firefox, Safari, and Edge. Our mobile apps for iOS and Android offer the full experience optimized for on-the-go studying.'
      },
      {
        question: 'What if I\'m having technical issues?',
        answer: 'Check our Help Center for common solutions, or contact support directly. Free users get email support (24-48 hour response), while Pro and Elite users get priority support with faster response times and phone/chat options.'
      },
      {
        question: 'Do you integrate with other apps I use?',
        answer: 'Yes! Clerva integrates with Google Calendar, Outlook, Apple Calendar, Zoom, Microsoft Teams, Google Drive, Dropbox, and many university LMS systems. We\'re constantly adding new integrations based on user requests.'
      },
      {
        question: 'What happens to my data if I delete my account?',
        answer: 'Your account enters a 30-day grace period where you can reactivate and recover everything. After 30 days, we permanently delete all your personal data, messages, and files. Study partners are notified of your departure, but group materials may be retained if others still need them.'
      }
    ]
  }
]

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggleItem = (categoryIndex: number, faqIndex: number) => {
    const key = `${categoryIndex}-${faqIndex}`
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const filteredCategories = faqCategories.map((category: any) => ({
    ...category,
    faqs: category.faqs.filter((faq: any) => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter((category: any) => category.faqs.length > 0)

  return (
    <div className='min-h-screen bg-white'>
      {/* Hero Section */}
      <section className='py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-50 to-secondary-50'>
        <div className='max-w-4xl mx-auto text-center'>
          <h1 className='text-4xl sm:text-5xl font-bold font-heading text-neutral-900 mb-6'>
            Questions About Our
            <span className='text-gradient block'>Beta Platform</span>
          </h1>
          <p className='text-xl text-neutral-600 max-w-3xl mx-auto mb-8'>
            We're a startup building something new. Here are answers to common questions. 
            Have more questions? We'd love to hear from you!
          </p>
          
          {/* Search Bar */}
          <div className='relative max-w-md mx-auto'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400' />
            <input
              type='text'
              placeholder='Search FAQs...'
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className='py-20 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto'>
          {filteredCategories.map((category, categoryIndex) => {
            const Icon = category.icon
            return (
              <div key={categoryIndex} className='mb-12'>
                <div className='flex items-center mb-8'>
                  <div className='bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mr-4'>
                    <Icon className='h-6 w-6 text-primary-600' />
                  </div>
                  <h2 className='text-2xl font-bold font-heading text-neutral-900'>{category.title}</h2>
                </div>
                
                <div className='space-y-4'>
                  {category.faqs.map((faq, faqIndex) => {
                    const key = `${categoryIndex}-${faqIndex}`
                    const isOpen = openItems[key]
                    
                    return (
                      <div key={faqIndex} className='border border-neutral-200 rounded-lg'>
                        <button
                          onClick={() => toggleItem(categoryIndex, faqIndex)}
                          className='w-full text-left p-6 flex items-center justify-between hover:bg-neutral-50 transition-colors duration-200'
                        >
                          <span className='font-medium text-neutral-900 pr-4'>{faq.question}</span>
                          {isOpen ? (
                            <ChevronUp className='h-5 w-5 text-neutral-500 flex-shrink-0' />
                          ) : (
                            <ChevronDown className='h-5 w-5 text-neutral-500 flex-shrink-0' />
                          )}
                        </button>
                        
                        {isOpen && (
                          <div className='px-6 pb-6'>
                            <p className='text-neutral-600 leading-relaxed'>{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
          
          {searchTerm && filteredCategories.length === 0 && (
            <div className='text-center py-12'>
              <HelpCircle className='h-16 w-16 text-neutral-300 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-neutral-900 mb-2'>No results found</h3>
              <p className='text-neutral-600 mb-6'>
                We couldn\'t find any FAQs matching "{searchTerm}". Try different keywords or contact our support team.
              </p>
              <button className='btn-primary'>
                Contact Support
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Contact Support Section */}
      <section className='py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-3xl font-bold font-heading text-neutral-900 mb-4'>
            Still Have Questions?
          </h2>
          <p className='text-xl text-neutral-600 mb-8'>
            Our support team is here to help you succeed. Get personalized assistance with any Clerva questions.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button className='btn-primary text-lg px-8 py-3'>
              Contact Support
            </button>
            <button className='btn-outline text-lg px-8 py-3'>
              Join Community Forum
            </button>
          </div>
          
          <div className='mt-12 grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='text-center'>
              <div className='bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
                <HelpCircle className='h-8 w-8 text-primary-600' />
              </div>
              <h3 className='font-semibold text-lg mb-2'>Help Center</h3>
              <p className='text-neutral-600'>Comprehensive guides and tutorials</p>
            </div>
            <div className='text-center'>
              <div className='bg-secondary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
                <Users className='h-8 w-8 text-secondary-600' />
              </div>
              <h3 className='font-semibold text-lg mb-2'>Community Forum</h3>
              <p className='text-neutral-600'>Connect with other Clerva users</p>
            </div>
            <div className='text-center'>
              <div className='bg-accent-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'>
                <Shield className='h-8 w-8 text-accent-600' />
              </div>
              <h3 className='font-semibold text-lg mb-2'>Priority Support</h3>
              <p className='text-neutral-600'>Upgrade for faster response times</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}