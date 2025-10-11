import React from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import './Button.css';

const Button = ({ 
  variant = 'default',
  size = 'medium',
  icon = null,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  children,
  className = '',
  onClick,
  ...props
}) => {
  const baseClass = 'btn';
  const classes = [
    baseClass,
    `btn--${variant}`,
    `btn--${size}`,
    disabled && 'btn--disabled',
    loading && 'btn--loading',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  const renderIcon = () => {
    if (loading) {
      return <Icon name="loading" className="btn__icon btn__icon--loading" />;
    }
    if (icon) {
      return <Icon name={icon} className={`btn__icon btn__icon--${iconPosition}`} />;
    }
    return null;
  };

  return (
    <button 
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      {children && <span className="btn__text">{children}</span>}
      {iconPosition === 'right' && renderIcon()}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'carousel-nav', 'modal-nav']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  icon: PropTypes.string,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func
};

export default Button;