import TemplateList from '../components/TemplateList';
import PostList from '@/components/PostList';

export default function Home() {
    return (
        <div className="min-h-full min-w-screen transition-colors duration-300 bg-none">
            <TemplateList />
            <PostList />
        </div>
    );
}
