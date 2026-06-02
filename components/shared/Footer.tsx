export default function Footer() {
  return (
    <footer className="w-full bg-[#333333] px-8 py-12 text-gray-400">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 md:flex-row md:justify-between">
        <div className="flex flex-col gap-2 text-sm">
          <p className="font-bold text-white">인터뷰핏 고객센터 0101-0101</p>
          <p>평일 오전 9시 - 오후 6시</p>
          <p className="mt-4 text-xs">
            서울특별시 도봉구 쌍문동 | 대표 : 공일공일<br />
            사업자등록번호 : 0101-0101-0101 | 이메일 : dotlink@gmail.com
          </p>
          <p className="mt-4 text-xs">
            © {new Date().getFullYear()} InterviewFit. All rights reserved.
          </p>
        </div>

        <div className="flex gap-6 text-sm font-medium text-gray-300">
          <a href="#" className="hover:text-white">이용약관</a>
          <a href="#" className="font-bold hover:text-white">개인정보처리방침</a>
          <a href="#" className="hover:text-white">고객센터</a>
        </div>
      </div>
    </footer>
  );
}