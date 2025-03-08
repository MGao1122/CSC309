import UserTemplateList from '../../components/UserTemplateList';
import UserPostList from '../../components/UserPostList';

export default function Home() {
    return (
        <div className="min-h-full min-w-screen transition-colors duration-300 bg-none">
            <UserTemplateList />   
            <UserPostList />
        </div>
    );
}
