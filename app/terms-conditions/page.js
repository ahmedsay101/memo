'use client'

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 font-arabic mb-8 text-center">
            الشروط والأحكام
          </h1>
          
          <div className="space-y-6 font-arabic text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">مقدمة</h2>
              <p>
                مرحباً بكم في ميموز بيتزا. هذه الشروط والأحكام تحكم استخدامكم لموقعنا الإلكتروني وخدماتنا. 
                باستخدام موقعنا أو تقديم طلب، فإنكم توافقون على هذه الشروط والأحكام.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">خدماتنا</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>نقدم خدمة توصيل الطعام للمنازل والمكاتب</li>
                <li>نوفر إمكانية الطلب المسبق</li>
                <li>جميع منتجاتنا تُحضر طازجة يومياً</li>
                <li>نحافظ على أعلى معايير الجودة والنظافة</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">الطلبات والدفع</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>يجب تأكيد الطلب خلال 15 دقيقة من تقديمه</li>
                <li>الأسعار تشمل ضريبة القيمة المضافة</li>
                <li>نقبل الدفع نقداً عند الاستلام أو بالبطاقات الائتمانية في حالة استلام من احد فروعنا فقط</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">سياسة التوصيل</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>وقت التوصيل المعتاد: 40-60 دقيقة</li>
                <li>قد يزيد وقت التوصيل في أوقات الذروة</li>
                <li>رسوم التوصيل تختلف حسب المنطقة</li>
                <li>نوصل في جميع أنحاء المدينة ضمن نطاق خدمتنا</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">مسؤوليات العميل</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>تقديم معلومات دقيقة للتواصل والعنوان</li>
                <li>التواجد في العنوان المحدد وقت التوصيل</li>
                <li>التعامل بأدب واحترام مع فريق الخدمة</li>
                <li>دفع قيمة الطلب كاملة عند الاستلام</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">حدود المسؤولية</h2>
              <p>
                شركة ميموز بيتزا غير مسؤولة عن أي أضرار غير مباشرة أو سوء تخزين للمنتج بعد الاستلام. 
                مسؤوليتنا محدودة بقيمة الطلب المقدم.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">تعديل الشروط</h2>
              <p>
                نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. التعديلات تصبح سارية المفعول 
                بمجرد نشرها على الموقع الإلكتروني.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">التواصل</h2>
              <p>
                لأي استفسارات حول هذه الشروط والأحكام، يرجى التواصل معنا عبر:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>الهاتف: 00201020207615</li>
                <li>البريد الإلكتروني: Memospizza37@gmail.com</li>
                <li>العنوان: أحد فروعنا المذكورة في الصفحة الرئيسية</li>
              </ul>
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