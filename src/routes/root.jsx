import { Form, NavLink, Outlet } from 'react-router-dom';

export default function Root() {
  const tools = [{ url: 'vb-model', name: 'VB Model' }];

  return (
    <>
      <div id='sidebar'>
        <h1>My VB Tools</h1>
        <nav>
          {tools.length ? (
            tools.map((tool, i) => (
              <ul>
                <li key={`tool-${i}`}>
                  <NavLink
                    to={`tools/${tool.url}`}
                    className={({ isActive, isPending }) =>
                      isActive ? 'active' : isPending ? 'pending' : ''
                    }
                  >
                    {tool.name}
                  </NavLink>
                </li>
              </ul>
            ))
          ) : (
            <p>
              <i>No tools</i>
            </p>
          )}
        </nav>
      </div>
      <div
        id='detail'
        className={navigation.state === 'loading' ? 'loading' : ''}
      >
        <Outlet />
      </div>
    </>
  );
}
