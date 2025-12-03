"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AceternityCard, CardBody, CardItem, CardImage } from "@/components/ui/aceternity-card";
import { Check, X, ArrowRight, Globe, Shield, TrendingUp, Users, Zap, Award, Sparkles, Plane, Hotel, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PLANS } from "@/lib/constants";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.2,
        ease: "power3.out",
      });

      gsap.from(ctaRef.current?.children || [], {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.4,
        stagger: 0.1,
        ease: "power3.out",
      });

      // Floating animation
      if (floatingRef.current) {
        gsap.to(floatingRef.current, {
          y: -20,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        });
      }

      // Scroll animations
      gsap.utils.toArray<HTMLElement>(".animate-on-scroll").forEach((element) => {
        gsap.from(element, {
          opacity: 0,
          y: 50,
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
          duration: 0.8,
          ease: "power3.out",
        });
      });

      // Parallax effect
      gsap.utils.toArray<HTMLElement>(".parallax").forEach((element) => {
        gsap.to(element, {
          y: (i, el) => {
            return -el.offsetHeight * 0.3;
          },
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
      <Navbar />

      {/* Hero Section with Background Image */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2070&auto=format&fit=crop"
            alt="Travel Hero"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-pink-900/40"></div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="text-center max-w-5xl mx-auto">
            <div
              ref={floatingRef}
              className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-8 border border-white/30"
            >
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-medium">Join 1000+ Affiliates Worldwide</span>
            </div>

            <h1
              ref={titleRef}
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 leading-tight"
              style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
            >
              Turn Travel Dreams
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                Into Earnings
              </span>
            </h1>

            <p
              ref={subtitleRef}
              className="text-xl md:text-2xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed font-medium"
              style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
            >
              Join the Tubira Affiliate Program and earn competitive commissions while helping travelers explore the world. Access flights, hotels, activities, and more—all in one powerful platform.
            </p>

            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all font-semibold"
              >
                <Link href="/register?plan=standard">
                  Start Earning Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full backdrop-blur-md font-semibold"
              >
                <Link href="#plans">View Plans</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 animate-on-scroll">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">$1M+</div>
                <div className="text-white/90">Paid to Affiliates</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">1000+</div>
                <div className="text-white/90">Active Partners</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">50+</div>
                <div className="text-white/90">Countries</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Tubira</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-8" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              At Tubira, we believe that travel should be effortless, accessible, and rewarding. Our platform unifies multiple travel products in one checkout, giving travelers the convenience of booking flights, accommodations, activities, and eSIM data plans without juggling multiple platforms.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              We operate globally, with strong coverage in USA, Canada, Mexico, Nigeria, and the UK, and growing presence across Africa, Europe, and North America.
            </p>
          </div>

          {/* Values Grid with Images */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              { 
                icon: Globe, 
                title: "Global Reach", 
                desc: "Connecting travelers and affiliates across borders",
                image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2070&auto=format&fit=crop"
              },
              { 
                icon: Shield, 
                title: "Integrity", 
                desc: "Transparent practices for travelers and affiliates alike",
                image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
              },
              { 
                icon: TrendingUp, 
                title: "Innovation", 
                desc: "Constantly improving booking experience and affiliate tools",
                image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop"
              },
            ].map((value, i) => (
              <AceternityCard key={i} className="h-[400px]">
                <CardImage src={value.image} alt={value.title} />
                <CardBody className="absolute bottom-0 left-0 right-0 text-white">
                  <CardItem className="mb-4">
                    <div className="inline-flex p-3 bg-white/20 backdrop-blur-md rounded-xl mb-3">
                      <value.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                    <p className="text-white/90">{value.desc}</p>
                  </CardItem>
                </CardBody>
              </AceternityCard>
            ))}
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section id="benefits" className="py-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              Why Become a <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Tubira Affiliate?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              Join thousands of successful affiliates earning competitive commissions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Comprehensive Marketplace",
                desc: "Promote flights, hotels, resorts, activities, cars, cruises, eSIM plans, and travel bundles—all in one platform.",
                gradient: "from-yellow-400 to-orange-500",
              },
              {
                icon: TrendingUp,
                title: "High Commissions",
                desc: "Earn competitive rates across multiple products. Focus on high-value bookings and multi-product attach for maximum revenue.",
                gradient: "from-green-400 to-blue-500",
              },
              {
                icon: Globe,
                title: "Global Audience",
                desc: "Reach travelers in multiple countries with regionally relevant inventory and pricing.",
                gradient: "from-blue-400 to-purple-500",
              },
              {
                icon: Shield,
                title: "Secure & Reliable",
                desc: "Our platform provides safe payments, multi-currency support, crypto options, and a secure user flow for your referrals.",
                gradient: "from-purple-400 to-pink-500",
              },
              {
                icon: Users,
                title: "Dedicated Support",
                desc: "You'll have access to a dashboard, reporting, and a partner manager to help you optimize campaigns and maximize earnings.",
                gradient: "from-pink-400 to-red-500",
              },
              {
                icon: Award,
                title: "Ethical Monetization",
                desc: "Help travelers save time and money while earning. Transparent reporting and timely payouts.",
                gradient: "from-indigo-400 to-purple-500",
              },
            ].map((benefit, i) => (
              <Card
                key={i}
                className="border-0 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 animate-on-scroll group"
              >
                <CardContent className="pt-6">
                  <div className={`inline-flex p-3 bg-gradient-to-br ${benefit.gradient} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                    <benefit.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>{benefit.title}</h3>
                  <p className="text-gray-600" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>{benefit.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section with Images */}
      <section id="plans" className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              Choose Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Plan</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              Select the plan that best fits your affiliate journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Standard Plan */}
            <AceternityCard className="h-[600px] border-2 hover:border-blue-500 transition-all shadow-xl animate-on-scroll">
              <CardImage 
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop" 
                alt="Standard Plan"
              />
              <CardBody className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md rounded-b-xl p-6">
                <CardItem>
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-3xl" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Standard Plan</CardTitle>
                    <div className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                      {PLANS.standard.priceDisplay}
                    </div>
                  </div>
                  <CardDescription className="text-base mb-4" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    Ideal for creators and small agencies starting their affiliate journey
                  </CardDescription>
                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="font-semibold mb-2 text-sm text-gray-700">Access to:</p>
                      <ul className="space-y-1">
                        {PLANS.standard.features.slice(0, 5).map((feature) => (
                          <li key={feature} className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full py-6 text-lg font-semibold"
                  >
                    <Link href="/register?plan=standard">
                      Join Standard Plan
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardItem>
              </CardBody>
            </AceternityCard>

            {/* Premium Plan */}
            <div className="relative">
              {/* Badge positioned outside card */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-50">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-full text-xs sm:text-sm font-bold shadow-2xl border-2 border-white whitespace-nowrap inline-flex items-center gap-1.5" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                  <span className="text-sm">⭐</span>
                  <span>Most Popular</span>
                </span>
              </div>
              <AceternityCard className="h-[600px] border-2 border-purple-500 shadow-2xl animate-on-scroll md:scale-105">
                <CardImage 
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop" 
                alt="Premium Plan"
              />
              <CardBody className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/98 to-white/95 backdrop-blur-md rounded-b-xl p-6">
                <CardItem>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                    <CardTitle className="text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Premium Plan</CardTitle>
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                      {PLANS.premium.priceDisplay}
                    </div>
                  </div>
                  <CardDescription className="text-sm sm:text-base mb-4" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
                    Perfect for high-volume affiliates who want access to all travel products
                  </CardDescription>
                  <div className="space-y-3 mb-6 max-h-[200px] overflow-y-auto">
                    <div>
                      <p className="font-semibold mb-2 text-xs sm:text-sm text-gray-700">Includes everything in Standard, plus:</p>
                      <ul className="space-y-1.5">
                        {PLANS.premium.features.map((feature) => (
                          <li key={feature} className="flex items-start text-xs sm:text-sm">
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-lg"
                  >
                    <Link href="/register?plan=premium">
                      Join Premium Plan
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Link>
                  </Button>
                </CardItem>
              </CardBody>
              </AceternityCard>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              Frequently Asked <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Questions</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: "How long is the tracking window?",
                a: "30–90 days depending on the campaign.",
              },
              {
                q: "What if bookings are canceled?",
                a: "Commissions adjust proportionally based on refunds.",
              },
              {
                q: "Can I request a custom landing page?",
                a: "Yes, co-branded corridor pages and deep-link parameters are available.",
              },
              {
                q: "Do you support API or inventory feeds?",
                a: "Yes, for advanced partners.",
              },
            ].map((faq, i) => (
              <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-all animate-on-scroll">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>{faq.q}</h3>
                  <p className="text-gray-600" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
            alt="CTA Background"
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              Ready to Start Earning?
            </h2>
            <p className="text-xl text-white/90 mb-8" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
              Join the Tubira Affiliate Network today and turn your audience's travel interests into real revenue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-full shadow-2xl font-semibold"
              >
                <Link href="/register?plan=standard">
                  Join Standard Plan
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full backdrop-blur-md font-semibold"
              >
                <Link href="/register?plan=premium">Upgrade to Premium</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
