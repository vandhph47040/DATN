import {
    createBrowserRouter,
    Navigate,
    Outlet,
    useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Home from "./page/client/Home/home";
import PlayingFilm from "./page/client/PlayingFilm/PlayingFilm";
import ComingFilm from "./page/client/ComingFilm/ComingFilm";
import CinemaForest from "./page/client/CinemaForest/CinemaForest";
import AdminLayout from "./page/admin/AdminLayout";
import FilmManage from "./page/admin/FilmManage/FilmManage";
import StoppedMovies from "./page/admin/FilmManage/StoppedMovies";
import AddFilm from "./page/admin/FilmManage/AddFilm";
import CalendarManage from "./page/admin/CalendarShow/CalendarManage";
import ShowtimesManage from "./page/admin/Showtimes/ShowtimesManage";
import ActorsManage from "./page/admin/Actors/ActorsManage";
import GenresManage from "./page/admin/Genres/GenresManage";
import DirectorsManage from "./page/admin/Directors/DirectorsManage";
import RoomPage from "./page/admin/RoomPage/RoomPage";
import FilmDetail from "./ClientComponents/FilmDetail/FilmDetail";
import Login from "./page/auth/Login";
import Register from "./page/auth/Register";
import GoogleCallback from "./page/auth/GoogleCallback";
import authService from "./services/auth.service";
import Booking from "./page/client/Booking/Booking";
import ForgotPassword from "./page/auth/ForgotPassword";
import TicketsPrice from "./page/admin/TicketsPrice/TicketsPrice";
import ArticleList from "./page/admin/Article/Article";
import DiscountManagement from "./page/admin/DisCound-Code/DisCount-code";
import OrderList from "./page/admin/Order/OrderList";
import OrderDetail from "./page/admin/Order/Orderdetail";
import Userlist from "./page/admin/Userpage/Userlist";
import Useradd from "./page/admin/Userpage/Useradd";
import UserDetail from "./page/admin/Userpage/Userdetails";
import Combo from "./page/admin/ComboPage/ComboPage";
import LayoutPaymentResult from "./ClientComponents/Booking/ResultPayment/LayoutPaymentResult";
import ProfilePage from "./page/admin/Profilepage/Profilepage";
import Dashboard from "./page/admin/Dashboard/Dashboard";
import DashBoardFilm from "./page/admin/Dashboard/DashBoardFilm";
import AdminStaffRoute from "./components/AdminStaffRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CheckinManage from "./page/admin/CheckInOut/CheckinManage";
import SliderPage from "./page/admin/Slider/SliderPage";
import ArticleDetail from "./ClientComponents/ArticleDetail/ArticleDetail";
import UserProfileRender from "./page/client/UserProfile/UserProfile";
import WheelRender from "./page/client/Wheel/WheelRender";
import ErrorResult from "./ClientComponents/Booking/ResultPayment/ErrorResult/ErrorResult";
import ClientLayout from "./page/client/Layout";
import Header from "./ClientComponents/Header/Header";
import AppFooter from "./ClientComponents/Footer/footer";
import RestoreRooms from "./page/admin/RoomPage/RestoreRooms";

axios.defaults.baseURL = "http://localhost:8000/api";
axios.defaults.headers.common["Content-Type"] = "application/json";

// Component hiển thị khi đang tải
const LoadingComponent = () => (
    <div
        style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            flexDirection: "column",
        }}
    >
        <div style={{ fontSize: "20px", marginBottom: "10px" }}>
            Đang tải...
        </div>
        <div
            style={{
                width: "50px",
                height: "50px",
                border: "5px solid #f3f3f3",
                borderTop: "5px solid #3498db",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
            }}
        ></div>
        <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
    </div>
);

// Route công khai cho các trang không yêu cầu đăng nhập
const PublicRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const authStatus = authService.isAuthenticated();
                setIsAuthenticated(authStatus);

                if (authStatus) {
                    const userRole = authService.getRole();
                    const redirectUrl = userRole === "admin" ? "/admin" : "/";
                    navigate(redirectUrl, { replace: true });
                }
            } catch (error) {
                console.error("Lỗi kiểm tra auth:", error);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [navigate]);

    if (loading) {
        return <LoadingComponent />;
    }

    return !isAuthenticated ? <Outlet /> : null;
};

// Cấu hình router
export const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/profile",
        element: <UserProfileRender></UserProfileRender>,
    },
    {
        path: "/playingFilm",
        element: <PlayingFilm />,
    },
    {
        path: "/comingFilm",
        element: <ComingFilm />,
    },
    {
        path: "/cinemaFilm",
        element: <CinemaForest />,
    },
    {
        path: "/filmDetail/:id",
        element: <FilmDetail />,
    },
    {
        path: "/article/:id",
        element: <ArticleDetail />,
    },
    {
        path: "/booking/payment-result",
        element: (
            <>
                <Header />
                <LayoutPaymentResult>
                    {" "}
                    <ErrorResult />
                </LayoutPaymentResult>
                <AppFooter></AppFooter>
            </>
        ),
    },
    {
        path: "/booking/:id",
        element: <Booking />,
        children: [
            {
                path: "payment-result",
                element: <LayoutPaymentResult />,
            },
        ],
    },
    {
        path: "/vongquaymayman",
        element: <WheelRender></WheelRender>,
    },
    {
        element: <PublicRoute />,
        children: [
            {
                path: "/auth/login",
                element: <Login />,
            },
            {
                path: "/auth/register",
                element: <Register />,
            },
            {
                path: "/auth/forgot-password",
                element: <ForgotPassword />,
            },
            {
                path: "/auth/google/callback",
                element: <GoogleCallback />,
            },
        ],
    },
    {
        element: <AdminStaffRoute />,
        children: [
            {
                path: "/admin",
                element: (
                    <>
                        <ToastContainer />
                        <AdminLayout />
                    </>
                ),
                children: [
                    {
                        index: true,
                        element: <Dashboard />,
                    },
                    { path: "dashboard", element: <Dashboard /> },
                    {
                        path: "dashboardFilm",
                        element: <DashBoardFilm />,
                    },
                    {
                        path: "film",
                        element: <FilmManage />,
                    },
                    {
                        path: "addFilm",
                        element: <AddFilm />,
                    },
                    {
                        path: "stoppedMovie",
                        element: <StoppedMovies />,
                    },
                    {
                        path: "calendarShow",
                        element: <CalendarManage />,
                    },
                    {
                        path: "showtimes",
                        element: <ShowtimesManage />,
                    },
                    {
                        path: "checkin",
                        element: <CheckinManage />,
                    },
                    {
                        path: "actors",
                        element: <ActorsManage />,
                    },
                    {
                        path: "directors",
                        element: <DirectorsManage />,
                    },
                    {
                        path: "genre",
                        element: <GenresManage />,
                    },
                    {
                        path: "rooms",
                        element: <RoomPage />,
                    },
                    {
                        path: "restoreRooms",
                        element: <RestoreRooms />,
                    },
                    {
                        path: "articlelist",
                        element: <ArticleList />,
                    },
                    {
                        path: "discount-code",
                        element: <DiscountManagement />,
                    },
                    {
                        path: "ticketsPrice",
                        element: <TicketsPrice></TicketsPrice>,
                    },
                    {
                        path: "orders",
                        element: <OrderList />,
                    },
                    {
                        path: "order/orderDetail",
                        element: <OrderDetail />,
                    },
                    {
                        path: "users",
                        element: <Userlist />,
                    },
                    {
                        path: "userpage/useradd",
                        element: <Useradd />,
                    },
                    {
                        path: "userpage/userdetail",
                        element: <UserDetail />,
                    },
                    {
                        path: "combo",
                        element: <Combo />,
                    },
                    {
                        path: "sliders",
                        element: <SliderPage />,
                    },
                    {
                        path: "profile",
                        element: <ProfilePage />,
                    },
                ],
            },
        ],
    },
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
]);

export default router;
