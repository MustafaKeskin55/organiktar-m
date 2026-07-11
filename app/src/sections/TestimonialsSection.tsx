import { useState, useEffect } from 'react';
import { Star, Quote, Loader2 } from 'lucide-react';
import { siteContentApi } from '@/lib/api';

interface Testimonial {
  id?: number;
  name: string;
  location: string;
  image: string;
  rating: number;
  text: string;
  role: string;
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const content = await siteContentApi.getTestimonials();
      setTestimonials(content.testimonials || []);
    } catch (error) {
      console.error('Testimonials yuklenirken hata:', error);
      // Fallback
      setTestimonials([
        { name: 'Merve K.', location: 'Kadikoy, Istanbul', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', rating: 5, text: 'Artik pazara gitmeye gerek kalmadi. Taze sebzelerim haftalik olarak kapima geliyor.', role: 'Abone' },
        { name: 'Can Y.', location: 'Besiktas, Istanbul', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', rating: 5, text: 'Zeytinyagi siparisi ettim, gercekten soguk sikim ve dogal.', role: 'Musteri' },
        { name: 'Elif T.', location: 'Uskudar, Istanbul', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', rating: 5, text: 'Cocuklarim icin guvenilir gida bulmak cok onemli.', role: 'Anne' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="flex h-64 items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </section>
    );
  }

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
            Musterilerimiz Ne Diyor?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Binlerce mutlu musterimizin deneyimleri
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative rounded-xl border bg-gray-50 p-6 transition-all hover:shadow-lg"
            >
              <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-green-600">
                <Quote className="h-4 w-4 text-white" />
              </div>

              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="mb-6 text-gray-700">{testimonial.text}</p>

              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
                <span className="ml-auto rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  {testimonial.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
