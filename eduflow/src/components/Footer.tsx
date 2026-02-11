export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 mt-auto">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            EduFlow
                        </span>
                        <p className="mt-4 text-gray-500 text-sm leading-relaxed max-w-xs">
                            แพลตฟอร์มการเรียนรู้ยุคใหม่ ที่เปิดโอกาสให้ทุกคนเข้าถึงความรู้ได้อย่างไร้ขีดจำกัด
                            เรียนรู้ได้ทุกที่ ทุกเวลา กับเนื้อหาคุณภาพ
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">เรียนรู้</h3>
                        <ul className="mt-4 space-y-4">
                            <li>
                                <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                                    หมวดหมู่ทั้งหมด
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                                    บทความ
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                                    วิดีโอสอน
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">ช่วยเหลือ</h3>
                        <ul className="mt-4 space-y-4">
                            <li>
                                <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                                    ศูนย์ช่วยเหลือ
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                                    ติดต่อเรา
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                                    นโยบายความเป็นส่วนตัว
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-gray-100 pt-8">
                    <p className="text-base text-gray-400 text-center">
                        &copy; {new Date().getFullYear()} EduFlow. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
