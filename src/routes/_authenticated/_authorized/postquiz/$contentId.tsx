
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */
import CourseView from '@/components/module/CourseView';
import { useUser } from '@/contexts/hooks/useUser';
import { usePostquiz } from '@/contexts/providers/CourseContextProvider';
import { addUserStatusFlag } from '@/core/authentication/UserStatusFlag';
import { Course, CourseContent } from '@/core/model/OattsModel';
import { UserStatusFlag } from '@/core/model/UserModel';
import { createFileRoute, Navigate, useNavigate, useParams } from '@tanstack/react-router'
import { useMemo } from 'react';


const FILE_ROUTE = `/_authenticated/_authorized/postquiz/$contentId`;

export const Route = createFileRoute(FILE_ROUTE)({
  component: RouteComponent,
})

function RouteComponent() {
  const { contentId } = useParams({ from: FILE_ROUTE });
  const courses = usePostquiz();
  const user = useUser();
  const navigate = useNavigate();
  
  const setContentID = (newContentId: string) => {
    navigate({ to: '.', params: { contentId: newContentId } });
  }
  
  // TODO: Probably better to check status at ./index.tsx instead of relying on the finish button here.
  const finish = async () => {
    if (!user || !user.user) {
      throw new Error("Cannot mark user as postquizzed. User is undefined! (Honestly how did this even happen...)");
    }
    await addUserStatusFlag(user.user, UserStatusFlag.PostQuizzed)
    navigate({ to: "/certificate" });
  }
  
  
  if (courses == null) {
    return <Navigate to="/certificate" />
  }
  
  
  const contents = useMemo(() => courses?.reduce((acc: CourseContent[], course) => [...acc, ...course.contents], []), [courses])

  const paNumber = useMemo(()=> courses?.reduce((acc: string[], course) => course.paNumber && !acc.includes(course.paNumber)? [...acc, course.paNumber]: [...acc], []), [courses])


  return <CourseView contents={contents} contentID={contentId} courseName="Postquiz" finish={finish} setContentID={setContentID} paNumber={paNumber.join(",")} />;
}
