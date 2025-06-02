import LogoutBtn from "../auth/LogoutBtn";
import EditProfileModal from "./EditProfileModal";

const Header = () => {
  return (
    <div className="flex flex-row justify-between items-center m-0 p-2 px-4 sm:p-[7px] sm:px-8 md:px-12 lg:px-20 bg-[#7A80DA] text-white">
      <h5 className="title text-[20px] sm:text-[24px] md:text-[28px] lg:text-[35px] cursor-pointer font-semibold truncate">
        ChatTalk!
      </h5>
      <div className="flex flex-row gap-1 sm:gap-2 items-center flex-shrink-0">
        <EditProfileModal />
        <LogoutBtn />
      </div>
    </div>
  );
};

export default Header;
