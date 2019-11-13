import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';
import EnrollmentController from './app/controllers/EnrollmentController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.get('/plans', PlanController.index);

routes.use(authMiddleware);

routes.post('/plans', PlanController.store);
routes.put('/plans', PlanController.update);
routes.delete('/plans/:id', PlanController.delete);

routes.post('/students', StudentController.store);
routes.put('/students/:id', StudentController.update);
routes.put('/users', UserController.update);

routes.get('/Enrollment', EnrollmentController.index);
routes.post('/Enrollment', EnrollmentController.store);
routes.put('/Enrollment/:id', EnrollmentController.update);
routes.delete('/Enrollment/:id', EnrollmentController.delete);

export default routes;
