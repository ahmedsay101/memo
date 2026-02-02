'use client'

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 font-arabic mb-8 text-center">
            سياسات الإلغاء والاستبدال والتوصيل
          </h1>
          
          <div className="space-y-8 font-arabic text-gray-700 leading-relaxed">
            {/* Cancellation Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-orange-600 mb-4 border-b-2 border-orange-200 pb-2">
                سياسة الإلغاء
              </h2>
              <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">إلغاء الطلب قبل التحضير</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>يمكن إلغاء الطلب مجاناً خلال 5 دقائق من التأكيد</li>
                    <li>سيتم رد المبلغ كاملاً في حالة الدفع المسبق</li>
                    <li>يرجى الاتصال فوراً لتجنب رسوم الإلغاء</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">إلغاء الطلب أثناء التحضير</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>رسوم إلغاء 25% من قيمة الطلب</li>
                    <li>يتم رد 75% من المبلغ المدفوع</li>
                    <li>وقت الإلغاء: حتى 15 دقيقة من بداية التحضير</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">إلغاء الطلب بعد الانطلاق للتوصيل</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>لا يمكن إلغاء الطلب بعد انطلاق المندوب</li>
                    <li>سيتم تحصيل كامل قيمة الطلب</li>
                    <li>في حالات الطوارئ، يمكن التفاوض مع خدمة العملاء</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Refund Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-teal-600 mb-4 border-b-2 border-teal-200 pb-2">
                سياسة الاستبدال والاسترداد
              </h2>
              <div className="space-y-4">
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">حالات الاستبدال المجاني</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>خطأ في الطلب من جانبنا</li>
                    <li>جودة الطعام غير مرضية</li>
                    <li>تأخير في التوصيل أكثر من 60 دقيقة</li>
                    <li>الطعام وصل بارد أو فاسد</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">إجراءات الاسترداد</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>الإبلاغ عن المشكلة خلال 30 دقيقة من الاستلام</li>
                    <li>تصوير الطلب في حالة مشاكل الجودة</li>
                    <li>فترة استرداد الأموال: 3-5 أيام عمل</li>
                    <li>يمكن اختيار استبدال الطلب بدلاً من الاسترداد</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">حالات عدم الاسترداد</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>تغيير الرأي بعد تأكيد الطلب</li>
                    <li>عدم التواجد في العنوان وقت التوصيل</li>
                    <li>رفض استلام الطلب بدون سبب مقبول</li>
                    <li>الطلبات المخصصة حسب طلب العميل</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Delivery Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-purple-600 mb-4 border-b-2 border-purple-200 pb-2">
                سياسة التوصيل
              </h2>
              <div className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">أوقات التوصيل</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>الوقت العادي: 30-45 دقيقة</li>
                    <li>أوقات الذروة: 45-60 دقيقة</li>
                    <li>الطلبات المخصصة: 60-90 دقيقة</li>
                    <li>الطلبات الكبيرة (+10 منتجات): 60-75 دقيقة</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">شروط التوصيل</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>يجب تواجد شخص بالغ لاستلام الطلب</li>
                    <li>تأكد من صحة رقم الهاتف والعنوان</li>
                    <li>في حالة عدم الرد، سنحاول الاتصال 3 مرات</li>
                    <li>بعدها سيعتبر الطلب ملغي ومستحق الدفع</li>
                    <li>نوصل لجميع المناطق ضمن نطاق خدمتنا</li>
                    <li>رسوم التوصيل تختلف حسب المنطقة</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">للاستفسارات والشكاوى</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>خدمة العملاء:</strong> 123-456-789</p>
                    <p><strong>واتساب:</strong> 123-456-789</p>
                  </div>
                  <div>
                    <p><strong>البريد الإلكتروني:</strong> support@memos-pizza.com</p>
                    <p><strong>ساعات العمل:</strong> يومياً من 3:00 ص إلى 2:00 ص</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center font-arabic">
              آخر تحديث: 2 فبراير 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}