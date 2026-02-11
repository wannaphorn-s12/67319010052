

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Play, Sparkles, Monitor, Users, Award, BookOpen, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sarabun bg-white selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 to-white -z-10" />
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl -z-10 mix-blend-multiply animate-pulse" />
          <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-3xl -z-10 mix-blend-multiply animate-pulse" style={{ animationDelay: '1s' }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-40">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-bold mb-8 animate-fade-in-up">
                <Sparkles size={16} />
                <span>แพลตฟอร์มการเรียนรู้ยุคใหม่</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
                เปิดโลกการเรียนรู้ <br className="hidden md:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
                  ไร้ขีดจำกัด
                </span>
              </h1>

              <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                EduFlow คือพื้นที่สำหรับทุกคนที่รักการเรียนรู้ รวบรวมคอร์สเรียนคุณภาพจากผู้เชี่ยวชาญ
                พร้อมระบบติดตามผลที่จะช่วยให้คุณไปถึงเป้าหมายได้เร็วยิ่งขึ้น
              </p>

              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/browse"
                  className="group flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold rounded-full text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1"
                >
                  <Play size={20} className="fill-current" />
                  เริ่มเรียนเลย
                </Link>
                <Link
                  href="/register"
                  className="group flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold rounded-full text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md hover:-translate-y-1"
                >
                  สมัครสมาชิกฟรี
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gray-50/50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-base text-indigo-600 font-bold tracking-widest uppercase mb-3">ฟีเจอร์เด่น</h2>
              <p className="text-3xl md:text-4xl font-extrabold text-gray-900">
                ครบทุกฟังก์ชันเพื่อการเรียนรู้
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {[
                {
                  icon: Monitor,
                  title: 'เรียนได้ทุกที่ทุกเวลา',
                  desc: 'เข้าถึงบทเรียนได้จากทุกอุปกรณ์ ไม่ว่าจะเป็นคอมพิวเตอร์ แท็บเล็ต หรือสมาร์ทโฟน',
                  color: 'text-blue-500',
                  bg: 'bg-blue-50'
                },
                {
                  icon: BookOpen,
                  title: 'เนื้อหาหลากหลาย',
                  desc: 'รองรับสื่อการสอนทุกรูปแบบ ทั้งวิดีโอไฟล์แนบ บทความ และแบบฝึกหัด',
                  color: 'text-indigo-500',
                  bg: 'bg-indigo-50'
                },
                {
                  icon: Award,
                  title: 'ระบบติดตามผล',
                  desc: 'บันทึกประวัติการเรียนและความก้าวหน้า ช่วยให้คุณไม่พลาดทุกเนื้อหาสำคัญ',
                  color: 'text-purple-500',
                  bg: 'bg-purple-50'
                }
              ].map((feature, idx) => (
                <div key={idx} className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 hover:-translate-y-1">
                  <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-900" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-30" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">พร้อมเริ่มต้นการเรียนรู้หรือยัง?</h2>
            <p className="text-indigo-100 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              สมัครสมาชิกวันนี้เพื่อเข้าถึงคอร์สเรียนคุณภาพมากมาย ฟรีไม่มีค่าใช้จ่าย
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold rounded-full text-indigo-900 bg-white hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              สมัครสมาชิกฟรีทันที
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
