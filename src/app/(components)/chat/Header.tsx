import LogoutBtn from "../auth/LogoutBtn";
import EditProfileModal from "./EditProfileModal";

const Header = () => {
  return (
    <div className="flex flex-row justify-between gap-6 m-0 p-[7px] px-20 bg-[#7A80DA]  text-white">
      <h5 className="title text-center text-[35px] cursor-pointer">
        ChatTalk!
      </h5>
      <div className="flex flex-row gap-1 items-center">
        <EditProfileModal />
        <LogoutBtn />
      </div>
    </div>
  );
};

export default Header;
