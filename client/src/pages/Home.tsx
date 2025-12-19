import { motion } from "framer-motion";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, ShieldCheck, Truck } from "lucide-react";
import { useCars } from "@/hooks/use-cars";
import { CarCard } from "@/components/cars/CarCard";

export default function Home() {
  const { data: featuredCars, isLoading } = useCars({ isFeatured: true });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
        {/* Unsplash image background with overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&auto=format&fit=crop&q=80"
            alt="Luxury Car Background"
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        </div>

        <div className="container-custom relative z-10">
          <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl"
            >
              Find Your Dream Ride
              <span className="block text-primary">Without The Hassle</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg leading-8 text-gray-300"
            >
              Discover our curated collection of premium vehicles. 
              From sports cars to family SUVs, quality is our guarantee.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 flex items-center justify-center gap-x-6"
            >
              <Link href="/cars">
                <Button size="lg" className="h-12 px-8 text-base btn-primary">
                  Browse Inventory
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base text-white border-white hover:bg-white hover:text-black">
                  Contact Sales <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container-custom">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Certified Quality", desc: "Every vehicle passes a 150-point inspection." },
              { icon: Star, title: "Premium Selection", desc: "Curated inventory of the finest brands." },
              { icon: Truck, title: "Home Delivery", desc: "We bring your new car directly to your driveway." },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-6 bg-card rounded-2xl shadow-sm border border-border/50"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-24">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured Vehicles</h2>
              <p className="text-muted-foreground mt-2">Hand-picked selections just for you.</p>
            </div>
            <Link href="/cars">
              <Button variant="ghost" className="hidden sm:flex">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-[400px] rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCars?.slice(0, 3).map((car: any) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center sm:hidden">
            <Link href="/cars">
              <Button variant="outline" className="w-full">View All Inventory</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
        <div className="container-custom grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white text-2xl font-display font-bold mb-4">AutoMarket</h3>
            <p className="max-w-md">
              The premier destination for finding high-quality new and used vehicles. 
              Trusted by thousands of drivers nationwide.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Links</h4>
            <ul className="space-y-2">
              <li><Link href="/cars" className="hover:text-white">Inventory</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link href="/login" className="hover:text-white">Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li>123 Auto Drive</li>
              <li>Motor City, MC 48201</li>
              <li>(555) 123-4567</li>
            </ul>
          </div>
        </div>
        <div className="container-custom mt-12 pt-8 border-t border-slate-800 text-center text-sm">
          © {new Date().getFullYear()} AutoMarket. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
