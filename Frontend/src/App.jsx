import {createBrowserRouter, RouterProvider} from "react-router-dom"
import Applayout from './Layout/Applayout';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import TradingTerminal from './components/TradingTerminal';
import Markets from './components/Markets';
import Dashboard from './components/Dashboard';
import Portfolio from './components/Portfolio';
import Positions from './components/Positions';
import OrderHistory from './components/OrderHistory';
import TradeHistory from './components/TradeHistory';
import Watchlist from './components/Watchlist';
import Analytics from './components/Analytics';
import TradeJournal from './components/TradeJournal';
import AICoach from './components/AICoach';
import Challenges from './components/Challenges';
import Leaderboard from './components/Leaderboard';
import MarketExplorer from './components/MarketExplorer';
import ApiDashboard from './components/ApiDashboard';
import Subscription from './components/Subscription';
import LearningCenter from './components/LearningCenter';
import AccountSettings from './components/AccountSettings';
import NotFound from './components/NotFound';
import AdminDashboard from "./components/AdminDashboard";
import BugReport from "./components/BugReport";
import AdminLogin from "./components/AdminLogin";
import ForgotPassword from "./components/ForgotPassword";
import VerifyOTP from "./components/VerifyOTP";

const router = createBrowserRouter([{
    path:"/",
    element:<Applayout/>,
    children:[
      {
        path:"/",
        element:<Home/>
      },
      {
        path:"/ApiDashboard",
        element:<ApiDashboard/>
      },
      {
        path:"/MarketExplorer",
        element:<MarketExplorer/>
      },
      {
        path:"/Leaderboard",
        element:<Leaderboard/>
      },
      {
        path:"/Challenges",
        element:<Challenges/>
      },
      {
        path:"/AICoach",
        element:<AICoach/>
      },
      {
        path:"/TradeJournal/:userid",
        element:<TradeJournal/>
      },
      {
        path:"/Analytics/:userid",
        element:<Analytics/>
      },
      {
        path:"/Watchlist/:userid",
        element:<Watchlist/>
      },
      {
        path:"/TradeHistory",
        element:<TradeHistory/>
      },
      {
        path:"/ForgotPassword",
        element:<ForgotPassword/>
      },
      {
        path:"/VerifyOTP",
        element:<VerifyOTP/>
      },
      {
        path:"/AdminLogin",
        element:<AdminLogin/>
      },
      {
        path:"/BugReport",
        element:<BugReport/>
      },
      {
        path:"/Positions/:userid",
        element:<Positions/>
      },
      {
        path:"/OrderHistory",
        element:<OrderHistory/>
      },
      {
        path:"/Portfolio/:userid",
        element:<Portfolio/>
      },
      {
        path:"/Dashboard/:userid",
        element:<Dashboard/>
      },
      {
        path:"/admin/AdminDashboard",
        element:<AdminDashboard/>
      },
      {
        path:"/Login",
        element:<Login/>
      },
      {
        path:"/Markets",
        element:<Markets/>
      },
      {
        path:"/Signup",
        element:<Signup/>
      },
      {
        path:"/AccountSettings/:userid",
        element:<AccountSettings/>
      },
      {
        path:"/LearningCenter",
        element:<LearningCenter/>
      },
      {
        path:"/Subscription",
        element:<Subscription/>
      },
      {
        path:"*",
        element:<NotFound/>
      },
    
    ]
  },  {
        path:"/TradingTerminal",
        element:<TradingTerminal/>
      },])

const App = () => <RouterProvider router={router} />;

export default App;
