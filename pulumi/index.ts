import {enforceTags} from './components/tagging';

// Whatever you activate as your user-defined cost allocation tags in your payer account ...
const tags = {
  'cost-center': '1234567890',
  // project
  // service
  // env
  // ...
};

enforceTags(tags);

import './components/s3';
import './components/cf';

// ...
