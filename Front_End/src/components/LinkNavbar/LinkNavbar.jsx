import './LinkNavbar.css';

function LinkNavbar(props) {
  return (
        <>
            <li><a href={props.link}>{props.linkName}</a></li>
        </>
  );
}

export default LinkNavbar;